import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, CreditCard, MapPin, Globe, Home, Briefcase, Building, Calendar, Wallet, Coins, RefreshCw, X, Plus, Minus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import useMarketData from '../hooks/userMarketData';
import axios from 'axios';
import Swal from 'sweetalert2';

// Define TypeScript interfaces
interface Customer {
  _id: string;
  customerName: string;
  userName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  kycStatus: 'pending' | 'registered' | 'rejected' | 'verified';
  type: 'B2B' | 'B2C';
  cash: number;
  spreadValue: number;
  dateOfBirth?: string;
  nationality?: string;
  residence?: string;
  idNumber?: string;
  bankAccountNumber?: string;
  sourceOfIncome?: string;
  image?: { url: string };
  branch?: Array<{
    branch: {
      _id: string;
      branchName: string;
      branchCode: string;
      branchAddress: string;
      chargeTo?: Array<{
        branch: { _id: string };
        amount: number;
        upTo?: Array<{ kg: number; percentage: number }>;
      }>;
    };
    gold: number;
  }>;
}

interface MarketData {
  bid: number;
  offer: number;
  marketStatus: string;
}

interface Branch {
  _id: string;
  branchName: string;
  branchCode?: string;
  branchAddress?: string;
}

// Utility to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Utility to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Header Component
const ProfileHeader: React.FC = () => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-white mb-2">Customer Profile</h1>
    <p className="text-lg text-gray-200">Account Overview & Information</p>
  </div>
);

// Market Data Component
interface MarketDataDisplayProps {
  marketData: MarketData | null;
  spreadValue: number;
}
const MarketDataDisplay: React.FC<MarketDataDisplayProps> = ({ marketData, spreadValue }) => (
  <div className="text-center mb-4">
    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-yellow-500/10 border border-yellow-500/20">
      <div className="flex items-center">
        <Coins className="w-4 h-4 text-yellow-400 mr-2" />
        <span className="text-sm text-gray-300 mr-2">BID:</span>
        <span className="text-red-400 font-semibold">${marketData?.bid ? (marketData.bid - spreadValue).toFixed(2) : 'Loading...'}</span>
      </div>
      <div className="w-px h-4 bg-gray-500"></div>
      <div className="flex items-center">
        <span className="text-sm text-gray-300 mr-2">ASK:</span>
        <span className="text-green-400 font-semibold">${marketData?.offer ? (marketData.offer + spreadValue).toFixed(2) : 'Loading...'}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ml-2 ${marketData?.marketStatus === 'TRADEABLE' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
    </div>
  </div>
);

// Profile Card Component
interface ProfileCardProps {
  customer: Customer;
  handleTransactionHistory: () => void;
  handleLogout: () => Promise<void>;
  navigate: (path: string) => void;
}
const ProfileCard: React.FC<ProfileCardProps> = ({ customer, handleTransactionHistory, handleLogout, navigate }) => (
  <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl relative">
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/20 z-10"
    >
      <LogOut className="w-4 h-4 text-red-400" />
    </button>
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
          {customer.image?.url ? (
            <img src={customer.image.url} alt={customer.customerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-16 h-16 text-white" />
            </div>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{customer.customerName || 'Customer'}</h2>
      <p className="text-gray-300 mb-1">@{customer.userName}</p>
      <p className="text-sm text-gray-400 mb-4">Member since {formatDate(customer.createdAt)}</p>
      {customer.kycStatus === 'pending' ? (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-sm font-medium mb-6">Not Verified</div>
      ) : customer.kycStatus === 'registered' ? (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30 text-green-300 text-sm font-medium mb-6">Registered</div>
      ) : customer.kycStatus === 'rejected' ? (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-sm font-medium mb-6">Rejected</div>
      ) : (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
          {customer.type}
        </div>
      )}
      {customer.kycStatus === 'pending' || customer.kycStatus === 'registered' || customer.kycStatus === 'rejected' ? (
        <button
          onClick={() => navigate(`/kyc-form/${customer._id}`)}
          disabled={customer.kycStatus === 'registered'}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          KYC Verification
        </button>
      ) : (
        <button
          onClick={handleTransactionHistory}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          View Transaction History
        </button>
      )}
    </div>
  </div>
);

// Wallet Card Component
interface WalletCardProps {
  customer: Customer;
  handleOpenTransactionModal: (type: 'deposit' | 'withdraw', asset: 'cash' | 'gold', branchId?: string | null) => void;
}
const WalletCard: React.FC<WalletCardProps> = ({ customer, handleOpenTransactionModal }) => (
  <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl mt-6">
    <div className="flex items-center mb-4">
      <Wallet className="w-6 h-6 text-blue-400 mr-2" />
      <h3 className="text-xl font-semibold text-white">Wallet</h3>
    </div>
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
              <span className="text-green-400 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm text-gray-300">Cash Balance</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(customer.cash)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenTransactionModal('deposit', 'cash')}
            className="flex-1 px-3 py-2 bg-green-600/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={() => handleOpenTransactionModal('withdraw', 'cash')}
            className="flex-1 px-3 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
          >
            <Minus className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Gold Balance</p>
              <p className="text-lg font-bold text-yellow-400">{customer.branch?.reduce((sum: number, b) => sum + (b.gold || 0), 0)} g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Personal Information Component
interface PersonalInfoCardProps {
  customer: Customer;
}
const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ customer }) => (
  <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl">
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <User className="w-5 h-5 mr-2 text-blue-400" />
      Personal Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center p-3 rounded-lg bg-white/5">
        <Mail className="w-5 h-5 text-gray-400 mr-3" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
          <p className="text-white">{customer.customerEmail}</p>
        </div>
      </div>
      <div className="flex items-center p-3 rounded-lg bg-white/5">
        <Phone className="w-5 h-5 text-gray-400 mr-3" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Contact</p>
          <p className="text-white">{customer.customerPhone}</p>
        </div>
      </div>
      {customer.kycStatus !== 'pending' && customer.kycStatus !== 'registered' && customer.kycStatus !== 'rejected' && (
        <>
          <div className="flex items-center p-3 rounded-lg bg-white/5">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Date of birth</p>
              <p className="text-white">{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-white/5">
            <Globe className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Nationality</p>
              <p className="text-white">{customer.nationality || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-white/5">
            <Home className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Residence</p>
              <p className="text-white">{customer.residence || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-white/5">
            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">ID Number</p>
              <p className="text-white">{customer.idNumber || 'N/A'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

// Financial Information Component
interface FinancialInfoCardProps {
  customer: Customer;
}
const FinancialInfoCard: React.FC<FinancialInfoCardProps> = ({ customer }) => (
  <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl">
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
      Financial Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center p-3 rounded-lg bg-white/5">
        <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Bank Account</p>
          <p className="text-white font-mono">{customer.bankAccountNumber || 'N/A'}</p>
        </div>
      </div>
      <div className="flex items-center p-3 rounded-lg bg-white/5">
        <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Income Source</p>
          <p className="text-white">{customer.sourceOfIncome || 'N/A'}</p>
        </div>
      </div>
    </div>
  </div>
);

// Branch Information Component
interface BranchInfoCardProps {
  customer: Customer;
  branches: Branch[];
  handleSwapLocation: () => void;
  handleOpenTransactionModal: (type: 'deposit' | 'withdraw', asset: 'cash' | 'gold', branchId?: string | null) => void;
  handleOpenGoldTradeModal: (type: 'buy' | 'sell', branchId?: string) => void;
}
const BranchInfoCard: React.FC<BranchInfoCardProps> = ({ customer, branches, handleSwapLocation, handleOpenTransactionModal, handleOpenGoldTradeModal }) => (
  <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white flex items-center">
        <Building className="w-5 h-5 mr-2 text-blue-400" />
        Branch Information
      </h3>
      <button
        onClick={handleSwapLocation}
        className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200 font-medium flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Swap Location
      </button>
    </div>
    <div className="space-y-4">
      {customer.branch && customer.branch.length > 0 ? (
        customer.branch.map((customerBranch) =>
          customerBranch.branch ? (
            <div key={customerBranch.branch._id} className="p-4 rounded-lg bg-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold">{customerBranch.branch.branchName}</h4>
                    <p className="text-sm text-gray-300">Code: {customerBranch.branch.branchCode}</p>
                    <p className="text-sm text-gray-400 mt-1">{customerBranch.branch.branchAddress}</p>
                    <p className="text-sm text-yellow-400 mt-2 font-medium">Gold: {customerBranch.gold} g</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleOpenTransactionModal('deposit', 'gold', customerBranch.branch._id)}
                      className="px-3 py-2 bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 rounded-lg hover:bg-yellow-600/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Deposit
                    </button>
                    <button
                      onClick={() => handleOpenTransactionModal('withdraw', 'gold', customerBranch.branch._id)}
                      className="px-3 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Minus className="w-4 h-4" />
                      Withdraw
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenGoldTradeModal('buy', customerBranch.branch._id)}
                      className="px-3 py-2 bg-green-600/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Buy Gold
                    </button>
                    <button
                      onClick={() => handleOpenGoldTradeModal('sell', customerBranch.branch._id)}
                      className="px-3 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Minus className="w-4 h-4" />
                      Sell Gold
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        )
      ) : (
        <div className="p-4 rounded-lg bg-white/5">
          <p className="text-sm text-gray-400">No branches assigned</p>
        </div>
      )}
    </div>
  </div>
);

// Branch Swap Modal Component
interface BranchSwapModalProps {
  isOpen: boolean;
  customer: Customer;
  branches: Branch[];
  fromLocation: string | null;
  setFromLocation: (value: string | null) => void;
  toLocation: string | null;
  setToLocation: (value: string | null) => void;
  goldQuantity: string;
  setGoldQuantity: (value: string) => void;
  paymentMethod: 'cash' | 'gold' | null;
  setPaymentMethod: (value: 'cash' | 'gold' | null) => void;
  handleBranchSwapRequest: () => Promise<void>;
  handleCancelSwap: () => void;
  swapLoading: boolean;
}
const BranchSwapModal: React.FC<BranchSwapModalProps> = ({
  isOpen,
  customer,
  branches,
  fromLocation,
  setFromLocation,
  toLocation,
  setToLocation,
  goldQuantity,
  setGoldQuantity,
  paymentMethod,
  setPaymentMethod,
  handleBranchSwapRequest,
  handleCancelSwap,
  swapLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Branch Gold Swap</h3>
          <button onClick={handleCancelSwap} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Location (Your Assigned Branches)</label>
            <select
              value={fromLocation || ''}
              onChange={(e) => setFromLocation(e.target.value || null)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" className="bg-gray-800 text-white">Select source branch</option>
              {customer.branch?.map((customerBranch) => (
                <option key={customerBranch.branch._id} value={customerBranch.branch._id} className="bg-gray-800 text-white">
                  {customerBranch.branch.branchName} (Gold: {customerBranch.gold}g)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To Location</label>
            <select
              value={toLocation || ''}
              onChange={(e) => setToLocation(e.target.value || null)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" className="bg-gray-800 text-white">Select destination branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id} className="bg-gray-800 text-white">{branch.branchName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gold Quantity</label>
            <div className="relative">
              <input
                type="number"
                value={goldQuantity}
                onChange={(e) => setGoldQuantity(e.target.value)}
                placeholder="Enter gold quantity"
                className="w-full pl-4 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                min="0"
                step="0.001"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">g</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Payment Method for Transfer Charge</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                  paymentMethod === 'cash' ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                }`}
              >
                <span className="text-lg">💵</span>
                <span className="font-medium">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('gold')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                  paymentMethod === 'gold' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                }`}
              >
                <span className="text-lg">🪙</span>
                <span className="font-medium">Gold</span>
              </button>
            </div>
          </div>
          {fromLocation && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              {(() => {
                const selectedFromBranch = customer.branch?.find((cb) => cb.branch._id === fromLocation);
                return (
                  <>
                    <p className="text-sm text-blue-300 font-medium">From: {selectedFromBranch?.branch.branchName}</p>
                    <p className="text-xs text-gray-300">Available Gold: {selectedFromBranch?.gold || 0}g</p>
                  </>
                );
              })()}
            </div>
          )}
          {toLocation && fromLocation && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              {(() => {
                const selectedFromBranch = customer.branch?.find((cb) => cb.branch._id === fromLocation);
                const selectedToBranch = branches.find((b) => b._id === toLocation);
                const chargeInfo = selectedFromBranch?.branch?.chargeTo?.find((ct) => ct.branch && ct.branch._id === toLocation);
                if (!chargeInfo) {
                  return <p className="text-sm text-red-400">⚠️ Transfer charge not set for this destination</p>;
                }
                return (
                  <>
                    <p className="text-sm text-green-300 font-medium">To: {selectedToBranch?.branchName}</p>
                    <p className="text-xs text-gray-300">
                      Transfer Charge: ${chargeInfo.amount}
                      {paymentMethod && (
                        <span className="ml-2 px-2 py-1 bg-white/10 rounded text-xs">
                          Paying by {paymentMethod === 'cash' ? '💵 Cash' : '🪙 Gold'}
                        </span>
                      )}
                    </p>
                    {/* --- Show charge slabs if available --- */}
                    {chargeInfo.upTo && chargeInfo.upTo.length > 0 && paymentMethod && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">Charge Slabs:</p>
                        <table className="w-full text-xs text-gray-200">
                          <thead >
                            <tr >
                              <th className="text-left text-black pr-2">Up to (kg)</th>
                              <th className="text-left text-black">Percentage (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chargeInfo.upTo.map((slab, idx) => (
                              <tr key={idx}>
                                <td className="pr-2">{slab.kg}</td>
                                <td>{slab.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          {fromLocation && goldQuantity && parseFloat(goldQuantity) > 0 && (
            <>
              {(() => {
                const selectedFromBranch = customer.branch?.find((cb) => cb.branch._id === fromLocation);
                const availableGold = selectedFromBranch?.gold || 0;
                if (parseFloat(goldQuantity) > availableGold) {
                  return (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">⚠️ Insufficient gold in source branch. Available: {availableGold}g</p>
                    </div>
                  );
                }
                return null;
              })()}
            </>
          )}
          {fromLocation && toLocation && paymentMethod && (
            <>
              {(() => {
                const selectedFromBranch = customer.branch?.find((cb) => cb.branch._id === fromLocation);
                const chargeInfo = selectedFromBranch?.branch?.chargeTo?.find((ct) => ct.branch && ct.branch._id === toLocation);
                if (!chargeInfo) return null;
                if (paymentMethod === 'cash' && customer.cash < chargeInfo.amount) {
                  return (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">
                        ⚠️ Insufficient cash balance for transfer charge. Required: ${chargeInfo.amount}, Available: ${customer.cash.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                if (paymentMethod === 'gold') {
                  const goldToUsdRate = 65;
                  const goldRequiredForCharge = chargeInfo.amount / goldToUsdRate;
                  const totalGoldNeeded = parseFloat(goldQuantity || '0') + goldRequiredForCharge;
                  const availableGold = selectedFromBranch?.gold || 0;
                  if (totalGoldNeeded > availableGold) {
                    return (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-400">
                          ⚠️ Insufficient gold for transfer and charge.
                          <br />Required: {totalGoldNeeded.toFixed(3)}g (Transfer: {goldQuantity}g + Charge: {goldRequiredForCharge.toFixed(3)}g)
                          <br />Available: {availableGold}g
                        </p>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancelSwap}
            className="flex-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleBranchSwapRequest}
            disabled={!fromLocation || !toLocation || !goldQuantity || !paymentMethod || swapLoading || parseFloat(goldQuantity) <= 0}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              fromLocation && toLocation && goldQuantity && paymentMethod && parseFloat(goldQuantity) > 0 && !swapLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {swapLoading ? 'Processing...' : 'Request Swap'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Transaction Modal Component
interface TransactionModalProps {
  isOpen: boolean;
  customer: Customer;
  transactionType: 'deposit' | 'withdraw';
  assetType: 'cash' | 'gold';
  selectedBranchId: string | null;
  transactionAmount: string;
  setTransactionAmount: (value: string) => void;
  handleTransactionSubmit: () => Promise<void>;
  handleCloseTransactionModal: () => void;
  transactionLoading: boolean;
}
const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  customer,
  transactionType,
  assetType,
  selectedBranchId,
  transactionAmount,
  setTransactionAmount,
  handleTransactionSubmit,
  handleCloseTransactionModal,
  transactionLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-lg mx-auto my-8 min-h-fit">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex-1 pr-4">
            {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} {assetType === 'cash' ? 'Cash' : 'Gold'}
            {selectedBranchId && assetType === 'gold'
              ? (() => {
                  const branchObj = customer.branch?.find((cb) => cb.branch._id === selectedBranchId);
                  return branchObj ? ` - ${branchObj.branch.branchName}` : '';
                })()
              : ''}
          </h3>
          <button 
            onClick={handleCloseTransactionModal} 
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4 p-4 rounded-lg bg-white/5">
            {assetType === 'cash' ? (
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-400 font-bold">$</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">Current Balance</p>
              <p className="text-lg font-bold text-white break-words">
                {assetType === 'cash'
                  ? formatCurrency(customer.cash)
                  : `${selectedBranchId ? customer.branch?.find((cb) => cb.branch._id === selectedBranchId)?.gold || 0 : customer.branch?.reduce((sum: number, b) => sum + (b.gold || 0), 0)} g`}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter {assetType === 'cash' ? 'amount' : 'quantity'}
            </label>
            <div className="relative">
              {assetType === 'cash' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  $
                </span>
              )}
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder={`Enter ${assetType === 'cash' ? 'amount' : 'quantity'}`}
                className={`w-full ${assetType === 'cash' ? 'pl-8' : 'pl-4'} pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                min="0"
                step={assetType === 'cash' ? '0.01' : '0.001'}
              />
              {assetType === 'gold' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  g
                </span>
              )}
            </div>
          </div>

          {transactionType === 'withdraw' && transactionAmount && (
            <div className="mt-2">
              {assetType === 'cash' && parseFloat(transactionAmount) > customer.cash && (
                <p className="text-sm text-red-400 break-words">
                  ⚠️ Insufficient cash balance. Available: {formatCurrency(customer.cash)}
                </p>
              )}
              {assetType === 'gold' &&
                selectedBranchId &&
                parseFloat(transactionAmount) > (customer.branch?.find((cb) => cb.branch._id === selectedBranchId)?.gold || 0) && (
                  <p className="text-sm text-red-400 break-words">
                    ⚠️ Insufficient gold balance in this branch. Available: {customer.branch?.find((cb) => cb.branch._id === selectedBranchId)?.gold || 0} g
                  </p>
                )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCloseTransactionModal}
            className="flex-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleTransactionSubmit}
            disabled={!transactionAmount || parseFloat(transactionAmount) <= 0 || transactionLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              transactionAmount && parseFloat(transactionAmount) > 0 && !transactionLoading
                ? transactionType === 'deposit'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {transactionLoading ? 'Processing...' : `Request ${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Gold Trade Modal Component
interface GoldTradeModalProps {
  isOpen: boolean;
  customer: Customer;
  goldTradeType: 'buy' | 'sell';
  selectedTradeBranchId: string | null;
  setSelectedTradeBranchId: (value: string | null) => void;
  goldTradeAmount: string;
  setGoldTradeAmount: (value: string) => void;
  marketData: MarketData | null;
  handleGoldTradeSubmit: () => Promise<void>;
  handleCloseGoldTradeModal: () => void;
  goldTradeLoading: boolean;
  calculateGoldPrice: (quantity: number, tradeType: 'buy' | 'sell') => number;
}
const GoldTradeModal: React.FC<GoldTradeModalProps> = ({
  isOpen,
  customer,
  goldTradeType,
  selectedTradeBranchId,
  setSelectedTradeBranchId,
  goldTradeAmount,
  setGoldTradeAmount,
  marketData,
  handleGoldTradeSubmit,
  handleCloseGoldTradeModal,
  goldTradeLoading,
  calculateGoldPrice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">{goldTradeType === 'buy' ? 'Buy' : 'Sell'} Gold</h3>
          <button onClick={handleCloseGoldTradeModal} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Branch</label>
            <select
              value={selectedTradeBranchId || ''}
              onChange={(e) => setSelectedTradeBranchId(e.target.value || null)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" className="bg-gray-800 text-white">Select a branch</option>
              {customer.branch?.map((customerBranch) => (
                <option key={customerBranch.branch._id} value={customerBranch.branch._id} className="bg-gray-800 text-white">
                  {customerBranch.branch.branchName} (Gold: {customerBranch.gold} g)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                  <span className="text-green-400 font-bold text-sm">$</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cash</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(customer.cash)}</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mr-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    Gold ({selectedTradeBranchId ? customer.branch?.find((cb) => cb.branch._id === selectedTradeBranchId)?.branch.branchName : 'Total'})
                  </p>
                  <p className="text-sm font-bold text-white">
                    {selectedTradeBranchId
                      ? customer.branch?.find((cb) => cb.branch._id === selectedTradeBranchId)?.gold || 0
                      : customer.branch?.reduce((sum: number, b) => sum + (b.gold || 0), 0)} g
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">BID</p>
                <p className="text-sm font-bold text-red-400">${marketData?.bid ? ((marketData.bid - customer.spreadValue) / 31.103).toFixed(2) : 'Loading...'}/g</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">ASK</p>
                <p className="text-sm font-bold text-green-400">${marketData?.offer ? ((marketData.offer + customer.spreadValue) / 31.103).toFixed(2) : 'Loading...'}/g</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Enter quantity (grams)</label>
            <div className="relative">
              <input
                type="number"
                value={goldTradeAmount}
                onChange={(e) => setGoldTradeAmount(e.target.value)}
                placeholder="Enter quantity"
                className="w-full pl-4 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                min="0"
                step="0.001"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">g</span>
            </div>
          </div>
          {goldTradeAmount && marketData?.offer && marketData?.bid && selectedTradeBranchId && (
            <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-gray-300">{goldTradeType === 'buy' ? 'Total Cost' : 'Total Proceeds'}:</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(calculateGoldPrice(parseFloat(goldTradeAmount), goldTradeType))}</p>
            </div>
          )}
          {goldTradeAmount && selectedTradeBranchId && (
            <>
              {goldTradeType === 'sell' && parseFloat(goldTradeAmount) > (customer.branch?.find((cb) => cb.branch._id === selectedTradeBranchId)?.gold || 0) && (
                <p className="text-sm text-red-400 mt-2">
                  ⚠️ Insufficient gold balance in {customer.branch?.find((cb) => cb.branch._id === selectedTradeBranchId)?.branch.branchName}. Available:{' '}
                  {customer.branch?.find((cb) => cb.branch._id === selectedTradeBranchId)?.gold || 0} g
                </p>
              )}
              {goldTradeType === 'buy' && marketData?.offer && calculateGoldPrice(parseFloat(goldTradeAmount), 'buy') > customer.cash && (
                <p className="text-sm text-red-400 mt-2">⚠️ Insufficient cash balance. Required: {formatCurrency(calculateGoldPrice(parseFloat(goldTradeAmount), 'buy'))}</p>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCloseGoldTradeModal}
            className="flex-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGoldTradeSubmit}
            disabled={!goldTradeAmount || parseFloat(goldTradeAmount) <= 0 || goldTradeLoading || !marketData?.offer || !marketData?.bid || !selectedTradeBranchId}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              goldTradeAmount && parseFloat(goldTradeAmount) > 0 && !goldTradeLoading && marketData?.offer && marketData?.bid && selectedTradeBranchId
                ? goldTradeType === 'buy'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {goldTradeLoading ? 'Processing...' : `${goldTradeType === 'buy' ? 'Buy' : 'Sell'} Gold`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main CustomerProfile Component
const CustomerProfile: React.FC = () => {
  const iscustomer = JSON.parse(localStorage.getItem('customer') || '{}') as { id: string };
  const { marketData } = useMarketData(['GOLD']) as { marketData: MarketData | null };
  const backendUrl: string = import.meta.env.VITE_API_URL;
  const customerId = iscustomer.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [selectedChargeItem, setSelectedChargeItem] = useState<any>(null);
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const [isGoldTradeModalOpen, setIsGoldTradeModalOpen] = useState<boolean>(false);
  const [goldTradeType, setGoldTradeType] = useState<'buy' | 'sell'>('buy');
  const [goldTradeAmount, setGoldTradeAmount] = useState<string>('');
  const [goldTradeLoading, setGoldTradeLoading] = useState<boolean>(false);
  const [fromLocation, setFromLocation] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [toLocation, setToLocation] = useState<string | null>(null);
  const [goldQuantity, setGoldQuantity] = useState<string>('');
  const [selectedTradeBranchId, setSelectedTradeBranchId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gold' | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [assetType, setAssetType] = useState<'cash' | 'gold'>('cash');
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // SSE connection reference
  const eventSourceRef = useRef<EventSource | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const showSuccessAlert = async (title: string, message: string): Promise<void> => {
    await Swal.fire({
      title,
      html: message,
      icon: 'success',
      confirmButtonText: 'Great!',
      background: '#1F2937',
      color: '#ffffff',
      confirmButtonColor: '#10B981',
    });
  };

  const showErrorAlert = async (title: string, message: string): Promise<void> => {
    await Swal.fire({
      title,
      html: message,
      icon: 'error',
      confirmButtonText: 'OK',
      background: '#1F2937',
      color: '#ffffff',
      confirmButtonColor: '#EF4444',
    });
  };

  const fetchCustomerById = async (): Promise<void> => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/customers/${customerId}`);
      setCustomer(res.data);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setCustomer(null);
    }
  };

  const fetchBranches = async (): Promise<void> => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/branches`);
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Set up SSE connection for real-time KYC updates
  const setupSSE = () => {
    if (!customerId) return;

    // Build SSE URL for customer-specific events
    console.log('Customer backendUrl:', backendUrl);
    
    // Always construct the full URL with /api/user path
    const baseUrl = backendUrl || 'http://localhost:5000';
    // Remove any trailing slashes and ensure we add the correct path
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const sseUrl = `${cleanBaseUrl}/api/user/events/${customerId}`;
    
    console.log('Setting up customer SSE connection to:', sseUrl);
    
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Create new EventSource connection
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    
    // Connection opened
    eventSource.onopen = () => {
      console.log('Customer SSE connection established');
    };
    
    // Listen for messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Customer SSE message received:', data);
        
        // Handle different event types
        switch (data.type) {
          case 'CONNECTION_ESTABLISHED':
            console.log('Customer SSE connection confirmed:', data.clientId);
            break;
            
          case 'KYC_STATUS_APPROVED':
            console.log('KYC approved:', data.message);
            // Refresh customer data to get updated KYC status
            fetchCustomerById();
            
            // Show success notification
            showSuccessAlert('KYC Approved! 🎉', data.message || 'Your KYC has been approved successfully!');
            break;
            
          case 'KYC_STATUS_REJECTED':
            console.log('KYC rejected:', data.message);
            // Refresh customer data to get updated KYC status
            fetchCustomerById();
            
            // Show rejection notification with reasons
            const reasons = data.data?.reasons ? data.data.reasons.join('<br>• ') : 'Please contact support for details.';
            showErrorAlert('KYC Rejected ❌', `${data.message}<br><br><strong>Reasons:</strong><br>• ${reasons}`);
            break;
            
          case 'KYC_STATUS_REVERSED':
            console.log('KYC status reversed:', data.message);
            // Refresh customer data to get updated KYC status
            fetchCustomerById();
            
            // Show reversal notification
            Swal.fire({
              title: 'KYC Status Updated',
              html: data.message || 'Your KYC status has been updated.',
              icon: 'info',
              confirmButtonText: 'OK',
              background: '#1F2937',
              color: '#ffffff',
              confirmButtonColor: '#3B82F6',
            });
            break;
            
          case 'REQFORM_STATUS_APPROVED':
            console.log('Request form approved:', data.message);
            // Refresh customer data to get updated balances
            fetchCustomerById();
            
            // Show success notification
            showSuccessAlert('Request Approved! 🎉', data.message || 'Your request has been approved successfully!');
            break;
            
          case 'REQFORM_STATUS_REJECTED':
            console.log('Request form rejected:', data.message);
            // Refresh customer data
            fetchCustomerById();
            
            // Show rejection notification
            showErrorAlert('Request Rejected ❌', data.message || 'Your request has been rejected.');
            break;
            
          case 'REQFORM_STATUS_REVERSED':
            console.log('Request form reversed:', data.message);
            // Refresh customer data to get updated balances
            fetchCustomerById();
            
            // Show reversal notification
            Swal.fire({
              title: 'Request Status Updated',
              html: data.message || 'Your request status has been updated.',
              icon: 'info',
              confirmButtonText: 'OK',
              background: '#1F2937',
              color: '#ffffff',
              confirmButtonColor: '#3B82F6',
            });
            break;
            
          default:
            console.log('Unknown customer SSE event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing customer SSE message:', error);
      }
    };
    
    // Handle errors
    eventSource.onerror = (error) => {
      console.error('Customer SSE connection error:', error);
      
      // If connection is closed, attempt to reconnect after 5 seconds
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('Customer SSE connection closed, attempting to reconnect in 5 seconds...');
        setTimeout(() => {
          setupSSE();
        }, 5000);
      }
    };
    
    return eventSource;
  };

  const handleSwapLocation = (): void => {
    setIsSwapModalOpen(true);
  };

  const handleCancelSwap = (): void => {
    setIsSwapModalOpen(false);
    setFromLocation(null);
    setToLocation(null);
    setGoldQuantity('');
  };

  const handleBranchSwapRequest = async (): Promise<void> => {
    if (!fromLocation) {
      await showErrorAlert('From Location Required', 'Please select a source branch for the gold transfer.');
      return;
    }
    if (!toLocation) {
      await showErrorAlert('To Location Required', 'Please select a destination branch for the gold transfer.');
      return;
    }
    if (!goldQuantity || parseFloat(goldQuantity) <= 0) {
      await showErrorAlert('Invalid Quantity', 'Please enter a valid gold quantity greater than 0.');
      return;
    }
    const quantity = parseFloat(goldQuantity);
    const selectedFromBranch = customer?.branch?.find((cb) => cb.branch._id === fromLocation);
    if (!selectedFromBranch) {
      await showErrorAlert('Branch Not Assigned', 'The selected source branch is not assigned to you.');
      return;
    }
    if (quantity > selectedFromBranch.gold) {
      await showErrorAlert('Insufficient Gold Balance', `Requested: ${quantity}g, Available: ${selectedFromBranch.gold}g`);
      return;
    }
    const chargeInfo = selectedFromBranch.branch.chargeTo?.find((ct) => ct.branch && ct.branch._id === toLocation);
    if (!chargeInfo) {
      await showErrorAlert('Transfer Charge Not Set', 'Transfer charge is not configured for the selected destination branch.');
      return;
    }
    if (customer && customer.cash < chargeInfo.amount) {
      await showErrorAlert('Insufficient Cash Balance', `Required: $${chargeInfo.amount}, Available: $${customer.cash.toFixed(2)}`);
      return;
    }
    const destinationBranch = branches.find((b) => b._id === toLocation);
    setSwapLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/reqform/${customer?._id}`, {
        customerId: customer?._id,
        type: 'swapping',
        quantity,
        toLocation,
        fromLocation,
        paymentMethod,
        ask: marketData?.offer,
      });
      await showSuccessAlert(
        'Swap Request Submitted Successfully!',
        `
        <div class="text-left">
          <p class="mb-2">Your gold swap request has been submitted:</p>
          <p class="mb-1"><strong>From:</strong> ${selectedFromBranch.branch.branchName}</p>
          <p class="mb-1"><strong>To:</strong> ${destinationBranch?.branchName || 'Selected Branch'}</p>
          <p class="mb-1"><strong>Quantity:</strong> ${quantity}g</p>
          <p className="mb-1"><strong>Transfer Charge:</strong> $${chargeInfo.amount}</p>
          <p class="text-sm text-gray-300 mt-3">You will receive a confirmation once the request is processed.</p>
        </div>
        `
      );
      setIsSwapModalOpen(false);
      setFromLocation(null);
      setToLocation(null);
      setGoldQuantity('');
      fetchCustomerById();
    } catch (err) {
      console.error('Error submitting branch swap request:', err);
      await showErrorAlert('Request Failed', 'Failed to submit branch swap request.');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleOpenTransactionModal = (type: 'deposit' | 'withdraw', asset: 'cash' | 'gold', branchId: string | null = null): void => {
    setTransactionType(type);
    setAssetType(asset);
    setTransactionAmount('');
    setSelectedBranchId(branchId);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = (): void => {
    setIsTransactionModalOpen(false);
    setTransactionAmount('');
    setSelectedBranchId(null);
  };

  const handleTransactionSubmit = async (): Promise<void> => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      await showErrorAlert('Invalid Amount', 'Please enter a valid amount/quantity greater than 0');
      return;
    }
    const amount = parseFloat(transactionAmount);
    if (transactionType === 'withdraw') {
      if (assetType === 'cash' && customer && amount > customer.cash) {
        await showErrorAlert('Insufficient Cash Balance', `Requested: ${formatCurrency(amount)}, Available: ${formatCurrency(customer.cash)}`);
        return;
      } else if (assetType === 'gold' && selectedBranchId) {
        const selectedBranch = customer?.branch?.find((cb) => cb.branch._id === selectedBranchId);
        if (!selectedBranch || amount > selectedBranch.gold) {
          await showErrorAlert('Insufficient Gold Balance', `Requested: ${amount} g, Available: ${selectedBranch?.gold || 0} g`);
          return;
        }
      }
    }
    setTransactionLoading(true);
    try {
      const requestBody = {
        type: transactionType,
        assetType,
        ...(assetType === 'cash' ? { amount } : { quantity: amount }),
        ...(selectedBranchId && assetType === 'gold' ? { branchId: selectedBranchId } : {}),
      };
      const response = await axios.post(`${backendUrl}/api/user/reqform/${customer?._id}`, requestBody);
      const selectedBranch = customer?.branch?.find((cb) => cb.branch._id === selectedBranchId);
      await showSuccessAlert(
        'Request Submitted Successfully!',
        `Your ${transactionType} request has been submitted:
         Asset: ${assetType.toUpperCase()}
         ${assetType === 'cash' ? 'Amount' : 'Quantity'}: ${assetType === 'cash' ? formatCurrency(amount) : amount + ' g'}
         ${selectedBranchId && assetType === 'gold' ? `Branch: ${selectedBranch?.branch.branchName}` : ''}`
      );
      setIsTransactionModalOpen(false);
      setTransactionAmount('');
      setSelectedBranchId(null);
      fetchCustomerById();
    } catch (err) {
      console.error('Error submitting transaction request:', err);
      await showErrorAlert('Request Failed', 'Failed to submit transaction request.');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleOpenGoldTradeModal = (type: 'buy' | 'sell', branchId?: string): void => {
    setGoldTradeType(type);
    setGoldTradeAmount('');
    setSelectedTradeBranchId(branchId || customer?.branch?.[0]?.branch._id || null);
    setIsGoldTradeModalOpen(true);
  };

  const handleCloseGoldTradeModal = (): void => {
    setIsGoldTradeModalOpen(false);
    setGoldTradeAmount('');
    setSelectedTradeBranchId(null);
  };

  const calculateGoldPrice = (quantity: number, tradeType: 'buy' | 'sell'): number => {
    if (!marketData?.offer || !marketData?.bid) return 0;
    if (tradeType === 'buy') {
      const askPricePerGram = (marketData.offer + (customer?.spreadValue || 0)) / 31.103;
      return askPricePerGram * quantity;
    } else {
      const bidPricePerGram = (marketData.bid - (customer?.spreadValue || 0)) / 31.103;
      return bidPricePerGram * quantity;
    }
  };

  const handleGoldTradeSubmit = async (): Promise<void> => {
    if (!goldTradeAmount || parseFloat(goldTradeAmount) <= 0) {
      await showErrorAlert('Invalid Quantity', 'Please enter a valid quantity greater than 0');
      return;
    }
    if (!selectedTradeBranchId) {
      await showErrorAlert('Branch Required', 'Please select a branch for this transaction.');
      return;
    }
    const quantity = parseFloat(goldTradeAmount);
    const selectedBranch = customer?.branch?.find((cb) => cb.branch._id === selectedTradeBranchId);
    if (!selectedBranch) {
      await showErrorAlert('Invalid Branch', 'The selected branch is not assigned to you.');
      return;
    }
    const cashAmount = calculateGoldPrice(quantity, goldTradeType);
    if (goldTradeType === 'buy' && customer && cashAmount > customer.cash) {
      await showErrorAlert('Insufficient Cash Balance', `Cost: ${formatCurrency(cashAmount)}, Available: ${formatCurrency(customer.cash)}`);
      return;
    } else if (goldTradeType === 'sell' && quantity > selectedBranch.gold) {
      await showErrorAlert('Insufficient Gold Balance', `Requested: ${quantity} g, Available: ${selectedBranch.gold} g`);
      return;
    }
    setGoldTradeLoading(true);
    try {
      const requestBody = {
        type: goldTradeType,
        quantity,
        cash: cashAmount,
        branchId: selectedTradeBranchId,
      };
      await axios.post(`${backendUrl}/api/user/reqformgold/${customerId}`, requestBody);
      await showSuccessAlert(
        `Gold ${goldTradeType === 'buy' ? 'Purchase' : 'Sale'} Request Submitted Successfully!`,
        `
        <div class="text-left">
          <p class="mb-2">Your gold ${goldTradeType} request has been submitted:</p>
          <p class="mb-1"><strong>Branch:</strong> ${selectedBranch.branch.branchName}</p>
          <p class="mb-1"><strong>Quantity:</strong> ${quantity} g</p>
          <p class="mb-1"><strong>${goldTradeType === 'buy' ? 'Cost' : 'Proceeds'}:</strong> ${formatCurrency(cashAmount)}</p>
          <p class="text-sm text-gray-300 mt-3">You will receive a confirmation once the request is processed.</p>
        </div>
        `
      );
      setIsGoldTradeModalOpen(false);
      setGoldTradeAmount('');
      setSelectedTradeBranchId(null);
      fetchCustomerById();
    } catch (err) {
      console.error('Error submitting gold trade request:', err);
      await showErrorAlert('Request Failed', 'Failed to submit gold trade request.');
    } finally {
      setGoldTradeLoading(false);
    }
  };

  const handleTransactionHistory = (): void => {
    navigate(`/history/${customerId}`);
  };

  const handleLogout = async (): Promise<void> => {
    const result = await Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      localStorage.clear();
      
      // Show success toast
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      setTimeout(() => {
        navigate('/auth/boxed-signin');
      }, 1000);
    }
  };

  useEffect(() => {
    if (iscustomer && customerId) {
      fetchCustomerById();
    } else {
      setCustomer(null);
    }
  }, [customerId, backendUrl]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/boxed-signin');
      return;
    }
    dispatch(setPageTitle('Profile'));
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchBranches();
  }, []);

  // Set up SSE connection for real-time KYC updates
  useEffect(() => {
    if (customerId) {
      const eventSource = setupSSE();
      
      // Cleanup on unmount
      return () => {
        if (eventSource) {
          console.log('Cleaning up customer SSE connection');
          eventSource.close();
        }
      };
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader />
        <MarketDataDisplay marketData={marketData} spreadValue={customer.spreadValue} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileCard customer={customer} handleTransactionHistory={handleTransactionHistory} handleLogout={handleLogout} navigate={navigate} />
            {customer.kycStatus !== 'pending' && customer.kycStatus !== 'registered' && customer.kycStatus !== 'rejected' && (
              <WalletCard customer={customer} handleOpenTransactionModal={handleOpenTransactionModal} />
            )}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoCard customer={customer} />
            {customer.kycStatus !== 'pending' && customer.kycStatus !== 'registered' && customer.kycStatus !== 'rejected' && (
              <>
                <FinancialInfoCard customer={customer} />
                <BranchInfoCard
                  customer={customer}
                  branches={branches}
                  handleSwapLocation={handleSwapLocation}
                  handleOpenTransactionModal={handleOpenTransactionModal}
                  handleOpenGoldTradeModal={handleOpenGoldTradeModal}
                />
              </>
            )}
          </div>
        </div>
        <BranchSwapModal
          isOpen={isSwapModalOpen}
          customer={customer}
          branches={branches}
          fromLocation={fromLocation}
          setFromLocation={setFromLocation}
          toLocation={toLocation}
          setToLocation={setToLocation}
          goldQuantity={goldQuantity}
          setGoldQuantity={setGoldQuantity}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleBranchSwapRequest={handleBranchSwapRequest}
          handleCancelSwap={handleCancelSwap}
          swapLoading={swapLoading}
        />
        <TransactionModal
          isOpen={isTransactionModalOpen}
          customer={customer}
          transactionType={transactionType}
          assetType={assetType}
          selectedBranchId={selectedBranchId}
          transactionAmount={transactionAmount}
          setTransactionAmount={setTransactionAmount}
          handleTransactionSubmit={handleTransactionSubmit}
          handleCloseTransactionModal={handleCloseTransactionModal}
          transactionLoading={transactionLoading}
        />
        <GoldTradeModal
          isOpen={isGoldTradeModalOpen}
          customer={customer}
          goldTradeType={goldTradeType}
          selectedTradeBranchId={selectedTradeBranchId}
          setSelectedTradeBranchId={setSelectedTradeBranchId}
          goldTradeAmount={goldTradeAmount}
          setGoldTradeAmount={setGoldTradeAmount}
          marketData={marketData}
          handleGoldTradeSubmit={handleGoldTradeSubmit}
          handleCloseGoldTradeModal={handleCloseGoldTradeModal}
          goldTradeLoading={goldTradeLoading}
          calculateGoldPrice={calculateGoldPrice}
        />
      </div>
    </div>
  );
};

export default CustomerProfile;