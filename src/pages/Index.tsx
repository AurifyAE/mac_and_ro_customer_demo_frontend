import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, MapPin, Globe, Home, Briefcase, Building, Calendar, Wallet, Coins, RefreshCw, X, Plus, Minus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import useMarketData from '../hooks/userMarketData';
import axios, { isCancel } from 'axios';
import Swal from 'sweetalert2';

const CustomerProfile = () => {
    const iscustomer = JSON.parse(localStorage.getItem('customer') || '{}');
    const { marketData } = useMarketData(['GOLD']) as { marketData: any | null };
    const backendUrl = import.meta.env.VITE_API_URL;
    console.log('marketData:', marketData);
    const customerId = iscustomer.id;
    const [customer, setCustomer] = useState<any>('');
    const [loading, setLoading] = useState(false);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    // const [allBranches, setBranches] = useState([]);
    const [selectedChargeItem, setSelectedChargeItem] = useState<any>(null);
    const [swapLoading, setSwapLoading] = useState(false);
    const [isGoldTradeModalOpen, setIsGoldTradeModalOpen] = useState(false);
    const [goldTradeType, setGoldTradeType] = useState<'buy' | 'sell'>('buy');
    const [goldTradeAmount, setGoldTradeAmount] = useState('');
    const [goldTradeLoading, setGoldTradeLoading] = useState(false);
    const [fromLocation, setFromLocation] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [toLocation, setToLocation] = useState<any>(null);
    const [goldQuantity, setGoldQuantity] = useState('');
const [selectedTradeBranchId, setSelectedTradeBranchId] = useState<string | null>(null);
    // New states for deposit/withdraw modals
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
    const [assetType, setAssetType] = useState<'cash' | 'gold'>('cash');
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Simple success alert for successful operations
    const showSuccessAlert = async (title: string, message: string) => {
        return Swal.fire({
            title: title,
            html: message,
            icon: 'success',
            confirmButtonText: 'Great!',
            background: '#1F2937',
            color: '#ffffff',
            confirmButtonColor: '#10B981',
        });
    };

    const fetchCustomerById = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/user/customers/${customerId}`);
            setCustomer(res.data);
        } catch (err) {
            console.error('Error fetching customer:', err);
            setCustomer(null);
        }
    };

    console.log(customer, 'customer data');

    const handleSwapLocation = () => {
        setIsSwapModalOpen(true);
    };

    // Replace the handleBranchSwapRequest function with this updated version:

    const handleBranchSwapRequest = async () => {
        // Basic validation checks
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

        // Check if fromLocation is assigned to customer
        const selectedFromBranch = customer.branch?.find((cb:any) => cb.branch._id === fromLocation);
        if (!selectedFromBranch) {
            await showErrorAlert('Branch Not Assigned', 'The selected source branch is not assigned to you. Please select a branch that is assigned to your account.');
            return;
        }

        // Check if source branch has enough gold
        if (quantity > selectedFromBranch.gold) {
            await showErrorAlert(
                'Insufficient Gold Balance',
                `The source branch doesn't have enough gold for this transfer:
            Requested: ${quantity}g
            Available: ${selectedFromBranch.gold}g
            Please reduce the quantity or select a different source branch.`
            );
            return;
        }

        // Find the charge information for the transfer (corrected)
        const chargeInfo = selectedFromBranch.branch.chargeTo?.find((ct: any) => ct.branch && ct.branch._id === toLocation);
        if (!chargeInfo) {
            await showErrorAlert('Transfer Charge Not Set', 'Transfer charge is not configured for the selected destination branch. Please contact support or select a different destination.');
            return;
        }

        // Check if customer has enough cash for transfer charge
        if (customer.cash < chargeInfo.amount) {
            await showErrorAlert(
                'Insufficient Cash Balance',
                `You don't have enough cash to pay for the transfer charge:
            Required: $${chargeInfo.amount}
            Available: $${customer.cash.toFixed(2)}
            Please add funds to your account before proceeding.`
            );
            return;
        }

        // Find the destination branch details for display
        const destinationBranch = branches.find((b) => b._id === toLocation);

        setSwapLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/user/reqform/${customer._id}`, {
                customerId: customer._id,
                type: 'swapping',
                quantity: quantity,
                toLocation: toLocation,
                fromLocation: fromLocation,
            });

            // Show success alert with SweetAlert2
            await showSuccessAlert(
                'Swap Request Submitted Successfully!',
                `
            <div class="text-left">
                <p class="mb-2">Your gold swap request has been submitted:</p>
                <p class="mb-1"><strong>From:</strong> ${selectedFromBranch.branch.branchName}</p>
                <p class="mb-1"><strong>To:</strong> ${destinationBranch?.branchName || 'Selected Branch'}</p>
                <p class="mb-1"><strong>Quantity:</strong> ${quantity}g</p>
                <p class="mb-1"><strong>Transfer Charge:</strong> $${chargeInfo.amount}</p>
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
            await showErrorAlert('Request Failed', 'Failed to submit branch swap request. Please try again.');
        } finally {
            setSwapLoading(false);
        }
    };
    const handleCancelSwap = () => {
        setIsSwapModalOpen(false);
        setFromLocation(null);
        setToLocation(null);
        setGoldQuantity('');
    };

    const fetchBranches = async () => {
        try {
            await axios.get(`${backendUrl}/api/user/branches`).then((response) => {
                setBranches(response.data);
            });
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    // New functions for deposit/withdraw
    const handleOpenTransactionModal = (type: 'deposit' | 'withdraw', asset: 'cash' | 'gold', branchId: string | null = null) => {
        setTransactionType(type);
        setAssetType(asset);
        setTransactionAmount('');
        setSelectedBranchId(branchId); // Set the branch ID
        setIsTransactionModalOpen(true);
    };

    const handleCloseTransactionModal = () => {
        setIsTransactionModalOpen(false);
        setTransactionAmount('');
        setSelectedBranchId(null); // Reset branch ID
    };

    const showErrorAlert = async (title: string, message: string) => {
        return Swal.fire({
            title: title,
            html: message,
            icon: 'error',
            confirmButtonText: 'OK',
            background: '#1F2937',
            color: '#ffffff',
            confirmButtonColor: '#EF4444',
        });
    };

    const handleTransactionSubmit = async () => {
        // Basic amount validation
        if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
            await showErrorAlert('Invalid Amount', 'Please enter a valid amount/quantity greater than 0');
            return;
        }

        const amount = parseFloat(transactionAmount);

        // Enhanced withdrawal validation with detailed error messages
        if (transactionType === 'withdraw') {
            if (assetType === 'cash') {
                if (amount > customer.cash) {
                    await showErrorAlert(
                        'Insufficient Cash Balance',
                        `You don't have enough cash for this withdrawal:
                         Requested: ${formatCurrency(amount)}
                         Available: ${formatCurrency(customer.cash)}
                         Please reduce the withdrawal amount or add funds to your account.`
                    );
                    return;
                }
            } else if (assetType === 'gold' && selectedBranchId) {
                const selectedBranch = customer.branch?.find((cb:any) => cb.branch._id === selectedBranchId);
                if (!selectedBranch || amount > selectedBranch.gold) {
                    await showErrorAlert(
                        'Insufficient Gold Balance',
                        `You don't have enough gold in this branch for this withdrawal:
                         Requested: ${amount} g
                         Available: ${selectedBranch?.gold || 0} g
                         Please reduce the withdrawal quantity or select a different branch.`
                    );
                    return;
                }
            }
        }

        setTransactionLoading(true);
        try {
            const requestBody = {
                type: transactionType,
                assetType: assetType,
                ...(assetType === 'cash' ? { amount: amount } : { quantity: amount }),
                ...(selectedBranchId && assetType === 'gold' ? { branchId: selectedBranchId } : {}), // Include branchId for gold transactions
            };
            const response = await axios.post(`${backendUrl}/api/user/reqform/${customer._id}`, requestBody);

            // Show success alert
            const selectedBranch = customer.branch?.find((cb:any) => cb.branch._id === selectedBranchId);
            await showSuccessAlert(
                'Request Submitted Successfully!',
                `Your ${transactionType} request has been submitted:
                 Asset: ${assetType.toUpperCase()}
                 ${assetType === 'cash' ? 'Amount' : 'Quantity'}: ${assetType === 'cash' ? formatCurrency(amount) : amount + ' g'}
                 ${selectedBranchId && assetType === 'gold' ? `Branch: ${selectedBranch?.branch.branchName}` : ''}
                 You will receive a confirmation once the request is processed.`
            );

            setIsTransactionModalOpen(false);
            setTransactionAmount('');
            setSelectedBranchId(null);
            fetchCustomerById(); // Refresh customer data
        } catch (err) {
            console.error('Error submitting transaction request:', err);
            await showErrorAlert('Request Failed', 'Failed to submit transaction request. Please try again.');
        } finally {
            setTransactionLoading(false);
        }
    };

const handleOpenGoldTradeModal = (type: 'buy' | 'sell', branchId?: string) => {
    setGoldTradeType(type);
    setGoldTradeAmount('');
    // Use the passed branchId if available, otherwise default to first branch
    setSelectedTradeBranchId(branchId || customer.branch?.[0]?.branch._id || null);
    setIsGoldTradeModalOpen(true);
};

const handleCloseGoldTradeModal = () => {
    setIsGoldTradeModalOpen(false);
    setGoldTradeAmount('');
    setSelectedTradeBranchId(null);
};

   const calculateGoldPrice = (quantity: number, tradeType: 'buy' | 'sell') => {
    if (!marketData?.offer || !marketData?.bid) return 0;
    if (tradeType === 'buy') {
        const askPricePerGram = (marketData.offer + customer.spreadValue) / 31.103;
        return askPricePerGram * quantity;
    } else {
        const bidPricePerGram = (marketData.bid - customer.spreadValue) / 31.103;
        return bidPricePerGram * quantity;
    }
};

  const handleGoldTradeSubmit = async () => {
    // Basic amount validation
    if (!goldTradeAmount || parseFloat(goldTradeAmount) <= 0) {
        await showErrorAlert('Invalid Quantity', 'Please enter a valid quantity greater than 0');
        return;
    }

    if (!selectedTradeBranchId) {
        await showErrorAlert('Branch Required', 'Please select a branch for this transaction.');
        return;
    }

    const quantity = parseFloat(goldTradeAmount);
    const selectedBranch = customer.branch?.find((cb:any) => cb.branch._id === selectedTradeBranchId);

    if (!selectedBranch) {
        await showErrorAlert('Invalid Branch', 'The selected branch is not assigned to you.');
        return;
    }

    // Calculate cash amount based on trade type
    const cashAmount = calculateGoldPrice(quantity, goldTradeType);

    // Validation based on trade type
    if (goldTradeType === 'buy') {
        if (cashAmount > customer.cash) {
            await showErrorAlert(
                'Insufficient Cash Balance',
                `You don't have enough cash to buy this gold:
                Cost: ${formatCurrency(cashAmount)}
                Available: ${formatCurrency(customer.cash)}
                Please reduce the quantity or add more funds.`
            );
            return;
        }
    } else if (goldTradeType === 'sell') {
        if (quantity > selectedBranch.gold) {
            await showErrorAlert(
                'Insufficient Gold Balance',
                `You don't have enough gold in ${selectedBranch.branch.branchName} for this sale:
                Requested: ${quantity} g
                Available: ${selectedBranch.gold} g
                Please reduce the quantity or select a different branch.`
            );
            return;
        }
    }

    setGoldTradeLoading(true);
    try {
        const requestBody = {
            type: goldTradeType,
            quantity: quantity,
            cash: cashAmount,
            branchId: selectedTradeBranchId,
        };
        console.log('Submitting gold trade request:', requestBody);

        await axios.post(`${backendUrl}/api/user/reqformgold/${customerId}`, requestBody);

        // Show success alert
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
        fetchCustomerById(); // Refresh customer data
    } catch (err) {
        console.error('Error submitting gold trade request:', err);
        await showErrorAlert('Request Failed', 'Failed to submit gold trade request. Please try again.');
    } finally {
        setGoldTradeLoading(false);
    }
};

    // Handle action buttons - simple functions without alerts
    const handleEditProfile = () => {
        // Add edit profile logic here
        console.log('Edit profile clicked');
    };

    const handleTransactionHistory = () => {
        navigate(`/history/${customerId}`);
    };

    const handleAddFunds = () => {
        // Add funds logic here
        console.log('Add funds clicked');
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

    const formatCurrency = (amount: any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: any) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('customer');
        // Remove any other items if needed
        localStorage.clear(); // If you want to clear everything
        navigate('/auth/boxed-signin');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    console.log(branches, 'branches data');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Customer Profile</h1>
                    <p className="text-lg text-gray-200">Account Overview & Information</p>
                </div>

                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center">
                            <Coins className="w-4 h-4 text-yellow-400 mr-2" />
                            <span className="text-sm text-gray-300 mr-2">Sell:</span>
                            <span className="text-yellow-400 font-semibold">${marketData?.bid ? (marketData.bid - customer.spreadValue).toFixed(2) : 'Loading...'}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-500"></div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-300 mr-2">Ask:</span>
                            <span className="text-green-400 font-semibold">${marketData?.offer ? (marketData.offer + customer.spreadValue).toFixed(2) : 'Loading...'}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ml-2 ${marketData?.marketStatus === 'TRADEABLE' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl relative">
                            {/* Logout Button - Top Right */}
                           <button
    onClick={handleLogout}
    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/20 z-10"
>
    <LogOut className="w-4 h-4 text-red-400" />
</button>

                            <div className="text-center">
                                {/* Profile Image */}
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

                                {/* Basic Info */}
                                <h2 className="text-2xl font-bold text-white mb-2">{customer.customerName}</h2>
                                <p className="text-gray-300 mb-1">@{customer.userName}</p>
                                <p className="text-sm text-gray-400 mb-4">Member since {formatDate(customer.createdAt)}</p>

                                {/* Account Type Badge */}
                                {customer.kycStatus === 'pending' || customer.kycStatus === 'registered' ? (
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-sm font-medium mb-6">Not Verified</div>
                                ) : (
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
                                        {customer.type === 'B2B' ? 'B2B' : 'B2C'}
                                    </div>
                                )}

                                {/* Transaction History Button */}
                                {customer.kycStatus === 'pending' || customer.kycStatus === 'registered' ? (
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
                        {customer.kycStatus === 'pending' || customer.kycStatus === 'registered' ? (
                            <div></div>
                        ) : (
                            <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl mt-6">
                                <div className="flex items-center mb-4">
                                    <Wallet className="w-6 h-6 text-blue-400 mr-2" />
                                    <h3 className="text-xl font-semibold text-white">Wallet</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Cash Balance */}
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

                                    {/* Gold Balance */}
                                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                                                    <Coins className="w-5 h-5 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-300">Gold Balance</p>
                                                    <p className="text-lg font-bold text-yellow-400">{customer.branch?.reduce((sum: number, b: any) => sum + (b.gold || 0), 0)} g</p>{' '}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Remove the global Buy/Sell Gold buttons from here */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
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
                                {customer.kycStatus === 'pending' || customer.kycStatus === 'registered' ? (
                                    <div></div>
                                ) : (
                                    <>
                                        <div className="flex items-center p-3 rounded-lg bg-white/5">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Date of birth</p>
                                                <p className="text-white">{new Date(customer.dateOfBirth).toLocaleDateString()}</p>{' '}
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 rounded-lg bg-white/5">
                                            <Globe className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Nationality</p>
                                                <p className="text-white">{customer.nationality}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 rounded-lg bg-white/5">
                                            <Home className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Residence</p>
                                                <p className="text-white">{customer.residence}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 rounded-lg bg-white/5">
                                            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">ID Number</p>
                                                <p className="text-white">{customer.idNumber}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {customer.kycStatus === 'pending' || customer.kycStatus === 'registered' ? (
                            <div></div>
                        ) : (
                            <>
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
                                                <p className="text-white font-mono">****{customer.bankAccountNumber ? customer.bankAccountNumber.slice(-4) : '----'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 rounded-lg bg-white/5">
                                            <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Income Source</p>
                                                <p className="text-white">{customer.sourceOfIncome}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Branch Information */}
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
    customer.branch.map((customerBranch: any) =>
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
                            </>
                        )}
                        {/* Financial Information */}
                    </div>
                </div>
            </div>

            {/* Branch Swap Modal */}

            {/* Branch Swap Modal */}
            {isSwapModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Branch Gold Swap</h3>
                            <button onClick={handleCancelSwap} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            {/* From Location Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">From Location (Your Assigned Branches)</label>
                                <select
                                    value={fromLocation || ''}
                                    onChange={(e) => {
                                        setFromLocation(e.target.value);
                                    }}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="" className="bg-gray-800 text-white">
                                        Select source branch
                                    </option>
                                    {customer.branch?.map((customerBranch:any) => (
                                        <option key={customerBranch.branch._id} value={customerBranch.branch._id} className="bg-gray-800 text-white">
                                            {customerBranch.branch.branchName} (Gold: {customerBranch.gold}g)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* To Location Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">To Location</label>
                                <select
                                    value={toLocation || ''}
                                    onChange={(e) => {
                                        setToLocation(e.target.value);
                                    }}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="" className="bg-gray-800 text-white">
                                        Select destination branch
                                    </option>
                                    {branches.map((branch) => (
                                        <option key={branch._id} value={branch._id} className="bg-gray-800 text-white">
                                            {branch.branchName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Gold Quantity Input */}
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

                            {/* Validation Messages and Info Display */}
                            {fromLocation && (
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    {(() => {
                                        const selectedFromBranch = customer.branch?.find((cb:any) => cb.branch._id === fromLocation);
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
                                        const selectedFromBranch = customer.branch?.find((cb:any) => cb.branch._id === fromLocation);
                                        const selectedToBranch = branches.find((b) => b._id === toLocation);
                                        console.log(selectedFromBranch, 'this is selected from branch');
                                        const chargeInfo = selectedFromBranch?.branch?.chargeTo?.find((ct:any) => ct.branch && ct.branch._id === toLocation);
                                        if (!chargeInfo) {
                                            return <p className="text-sm text-red-400">⚠️ Transfer charge not set for this destination</p>;
                                        }

                                        return (
                                            <>
                                                <p className="text-sm text-green-300 font-medium">To: {selectedToBranch?.branchName}</p>
                                                <p className="text-xs text-gray-300">Transfer Charge: ${chargeInfo.amount}</p>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Error Messages */}
                            {fromLocation && goldQuantity && parseFloat(goldQuantity) > 0 && (
                                <>
                                    {(() => {
                                        const selectedFromBranch = customer.branch?.find((cb:any) => cb.branch._id === fromLocation);
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

                            {fromLocation && toLocation && (
                                <>
                                    {(() => {
                                        const selectedFromBranch = customer.branch?.find((cb:any) => cb.branch._id === fromLocation);
                                        const chargeInfo = selectedFromBranch?.branch?.chargeTo?.find((ct:any) => ct.branch === toLocation);

                                        if (chargeInfo && customer.cash < chargeInfo.amount) {
                                            return (
                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <p className="text-sm text-red-400">
                                                        ⚠️ Insufficient cash balance for transfer charge. Required: ${chargeInfo.amount}, Available: ${customer.cash.toFixed(2)}
                                                    </p>
                                                </div>
                                            );
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
                                disabled={!fromLocation || !toLocation || !goldQuantity || swapLoading || parseFloat(goldQuantity) <= 0}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    fromLocation && toLocation && goldQuantity && parseFloat(goldQuantity) > 0 && !swapLoading
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {swapLoading ? 'Processing...' : 'Request Swap'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Modal (Deposit/Withdraw) */}
            {isTransactionModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">
                                {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} {assetType === 'cash' ? 'Cash' : 'Gold'}
                                {selectedBranchId && assetType === 'gold'
                                    ? (() => {
                                        const branchObj = customer.branch?.find((cb:any) => cb.branch._id === selectedBranchId);
                                        return branchObj ? ` - ${branchObj.branch.branchName}` : '';
                                    })()
                                    : ''
                                }
                            </h3>
                            <button onClick={handleCloseTransactionModal} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center mb-4 p-4 rounded-lg bg-white/5">
                                {assetType === 'cash' ? (
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                                        <span className="text-green-400 font-bold">$</span>
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                                        <Coins className="w-5 h-5 text-yellow-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-300">Current Balance</p>
                                    <p className="text-lg font-bold text-white">
                                        {assetType === 'cash'
                                            ? formatCurrency(customer.cash)
                                            : `${selectedBranchId ? customer.branch?.find((cb:any) => cb.branch._id === selectedBranchId)?.gold || 0 : customer.gold} g`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Enter {assetType === 'cash' ? 'amount' : 'quantity'}</label>
                                <div className="relative">
                                    {assetType === 'cash' && <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>}
                                    <input
                                        type="number"
                                        value={transactionAmount}
                                        onChange={(e) => setTransactionAmount(e.target.value)}
                                        placeholder={`Enter ${assetType === 'cash' ? 'amount' : 'quantity'}`}
                                        className={`w-full ${
                                            assetType === 'cash' ? 'pl-8' : 'pl-4'
                                        } pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                                        min="0"
                                        step={assetType === 'cash' ? '0.01' : '0.001'}
                                    />
                                    {assetType === 'gold' && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">g</span>}
                                </div>
                            </div>

                            {/* Validation Messages */}
                            {transactionType === 'withdraw' && transactionAmount && (
                                <>
                                    {assetType === 'cash' && parseFloat(transactionAmount) > customer.cash && (
                                        <p className="text-sm text-red-400 mt-2">⚠️ Insufficient cash balance. Available: {formatCurrency(customer.cash)}</p>
                                    )}
                                    {assetType === 'gold' && selectedBranchId && parseFloat(transactionAmount) > (customer.branch?.find((cb:any) => cb.branch._id === selectedBranchId)?.gold || 0) && (
                                        <p className="text-sm text-red-400 mt-2">
                                            ⚠️ Insufficient gold balance in this branch. Available: {customer.branch?.find((cb:any) => cb.branch._id === selectedBranchId)?.gold || 0} g
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
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
            )}

            {/* Gold Trade Modal */}

           {isGoldTradeModalOpen && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{goldTradeType === 'buy' ? 'Buy' : 'Sell'} Gold</h3>
                <button onClick={handleCloseGoldTradeModal} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="mb-6">
                {/* Branch Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Branch</label>
                    <select
                        value={selectedTradeBranchId || ''}
                        onChange={(e) => setSelectedTradeBranchId(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="" className="bg-gray-800 text-white">
                            Select a branch
                        </option>
                        {customer.branch?.map((customerBranch:any) => (
                            <option key={customerBranch.branch._id} value={customerBranch.branch._id} className="bg-gray-800 text-white">
                                {customerBranch.branch.branchName} (Gold: {customerBranch.gold} g)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Current Balances */}
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
                                <p className="text-xs text-gray-400">Gold ({selectedTradeBranchId ? customer.branch?.find((cb:any) => cb.branch._id === selectedTradeBranchId)?.branch.branchName : 'Total'})</p>
                                <p className="text-sm font-bold text-white">
                                    {selectedTradeBranchId ? customer.branch?.find((cb:any) => cb.branch._id === selectedTradeBranchId)?.gold || 0 : customer.branch?.reduce((sum: number, b: any) => sum + (b.gold || 0), 0)} g
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gold Price Info */}
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400">Sell Price</p>
                            <p className="text-sm font-bold text-red-400">${marketData?.bid ? ((marketData.bid - customer.spreadValue) / 31.103).toFixed(2) : 'Loading...'}/g</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Ask Price</p>
                            <p className="text-sm font-bold text-green-400">${marketData?.offer ? ((marketData.offer + customer.spreadValue) / 31.103).toFixed(2) : 'Loading...'}/g</p>
                        </div>
                    </div>
                </div>

                {/* Quantity Input */}
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

                {/* Cost/Proceeds Calculation */}
                {goldTradeAmount && marketData?.offer && marketData?.bid && selectedTradeBranchId && (
                    <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-gray-300">{goldTradeType === 'buy' ? 'Total Cost' : 'Total Proceeds'}:</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(calculateGoldPrice(parseFloat(goldTradeAmount), goldTradeType))}</p>
                    </div>
                )}

                {/* Validation Messages */}
                {goldTradeAmount && selectedTradeBranchId && (
                    <>
                        {goldTradeType === 'sell' && parseFloat(goldTradeAmount) > (customer.branch?.find((cb:any) => cb.branch._id === selectedTradeBranchId)?.gold || 0) && (
                            <p className="text-sm text-red-400 mt-2">
                                ⚠️ Insufficient gold balance in {customer.branch?.find((cb:any) => cb.branch._id === selectedTradeBranchId)?.branch.branchName}. Available:{' '}
                                {customer.branch?.find((cb:any) => cb.branch._id === selectedTradeBranchId)?.gold || 0} g
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
)}
        </div>
    );
};

export default CustomerProfile;
