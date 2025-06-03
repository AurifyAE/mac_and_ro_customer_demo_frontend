import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Calendar, DollarSign, Coins, Building, RefreshCw, Eye, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface BranchLocation {
    branchName: string;
    branchCode: string;
}

interface Transaction {
    _id: string;
    type: string;
    assetType?: string | null;
    amount?: number | null;
    quantity?: number | null;
    status: string;
    createdAt: string;
    updatedAt?: string;
    Remarks?: string | null;
    fromLocation?: BranchLocation | null;
    toLocation?: BranchLocation | null;
}

const TransactionHistory = () => {
    // Mock data - replace with actual API call
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const id = useParams().id; // Replace with actual customer ID from context or props
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        assetType: 'all',
        dateRange: 'all'
    });
    console.log("Customer ID:", id);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const backendUrl = import.meta.env.VITE_API_URL; // Ensure this is set in your environment variables

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/user/reqform/customer/${id}`);
                // Ensure the response data is an array
                console.log('response:', response.data);
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                console.log("Fetched transactions:", data);
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                // Set to empty array on error to prevent crashes
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (id && backendUrl) {
            fetchTransactions();
        }
    }, [id, backendUrl]);

    // Filter transactions based on current filters
    useEffect(() => {
        // Ensure transactions is always an array before filtering
        if (!Array.isArray(transactions)) {
            setFilteredTransactions([]);
            return;
        }

        let filtered = transactions;

        if (filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === filters.type);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(t => t.status === filters.status);
        }
        if (filters.assetType !== 'all') {
            filtered = filtered.filter(t => t.assetType === filters.assetType);
        }
        if (searchTerm) {
            filtered = filtered.filter(t => 
                t._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.Remarks && t.Remarks.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredTransactions(filtered);
    }, [filters, searchTerm, transactions]);

    const formatCurrency = (amount:any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString:any) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status:any) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status:any) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'rejected':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getTypeIcon = (type:any, assetType:any) => {
        switch (type) {
            case 'deposit':
                return assetType === 'cash' ? 
                    <ArrowDownCircle className="w-5 h-5 text-green-400" /> : 
                    <ArrowDownCircle className="w-5 h-5 text-yellow-400" />;
            case 'withdraw':
                return assetType === 'cash' ? 
                    <ArrowUpCircle className="w-5 h-5 text-red-400" /> : 
                    <ArrowUpCircle className="w-5 h-5 text-orange-400" />;
            case 'buy':
                return <TrendingUp className="w-5 h-5 text-green-400" />;
            case 'sell':
                return <TrendingDown className="w-5 h-5 text-blue-400" />;
            case 'swapping':
                return <RefreshCw className="w-5 h-5 text-purple-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getTypeColor = (type:any) => {
        switch (type) {
            case 'deposit':
                return 'bg-green-500/10 text-green-400';
            case 'withdraw':
                return 'bg-red-500/10 text-red-400';
            case 'buy':
                return 'bg-green-500/10 text-green-400';
            case 'sell':
                return 'bg-blue-500/10 text-blue-400';
            case 'swapping':
                return 'bg-purple-500/10 text-purple-400';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
    };

    const getTransactionSummary = () => {
        // Ensure transactions is an array before using .filter()
        const transactionArray = Array.isArray(transactions) ? transactions : [];
        
        const summary = {
            total: transactionArray.length,
            pending: transactionArray.filter(t => t.status === 'pending').length,
            approved: transactionArray.filter(t => t.status === 'approved').length,
            rejected: transactionArray.filter(t => t.status === 'rejected').length
        };
        return summary;
    };

    const summary = getTransactionSummary();
    const navigate = useNavigate();

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading transactions...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/20"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Transaction History</h1>
                            <p className="text-lg text-gray-200">View and manage your transaction records</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300">Total</p>
                                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300">Pending</p>
                                    <p className="text-2xl font-bold text-white">{summary.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300">Approved</p>
                                    <p className="text-2xl font-bold text-white">{summary.approved}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                                    <XCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300">Rejected</p>
                                    <p className="text-2xl font-bold text-white">{summary.rejected}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Filter className="w-5 h-5 text-gray-300" />
                            <h3 className="text-lg font-semibold text-white">Filters</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                <select 
                                    value={filters.type}
                                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="withdraw">Withdraw</option>
                                    <option value="buy">Buy Gold</option>
                                    <option value="sell">Sell Gold</option>
                                    <option value="swapping">Branch Swap</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select 
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
                                <select 
                                    value={filters.assetType}
                                    onChange={(e) => setFilters({...filters, assetType: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Assets</option>
                                    <option value="cash">Cash</option>
                                    <option value="gold">Gold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search transactions..."
                                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    setFilters({type: 'all', status: 'all', assetType: 'all', dateRange: 'all'});
                                    setSearchTerm('');
                                }}
                                className="px-4 py-2 bg-gray-600/20 text-gray-300 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition-all duration-200 text-sm"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-semibold text-white">
                            Transactions ({filteredTransactions.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-white/10">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-300">No transactions found</p>
                                <p className="text-sm text-gray-400">Try adjusting your filters</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <div key={transaction._id} className="p-6 hover:bg-white/5 transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {getTypeIcon(transaction.type, transaction.assetType)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                    </span>
                                                    {transaction.assetType && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                                                            {transaction.assetType === 'cash' ? <DollarSign className="w-3 h-3 mr-1" /> : <Coins className="w-3 h-3 mr-1" />}
                                                            {transaction.assetType.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-white font-medium">
                                                    {transaction.type === 'swapping' ? (
                                                        <span>Branch Transfer: {transaction.fromLocation?.branchName} → {transaction.toLocation?.branchName}</span>
                                                    ) : (
                                                        <span>
                                                            {transaction.assetType === 'cash' ? 
                                                                formatCurrency(transaction.amount) : 
                                                                `${transaction.quantity} g`
                                                            }
                                                            {transaction.type === 'buy' && ` (Cost: ${formatCurrency(transaction.amount)})`}
                                                            {transaction.type === 'sell' && ` (Value: ${formatCurrency(transaction.amount)})`}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    {formatDate(transaction.createdAt)}
                                                    {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && 
                                                        ` • Updated: ${formatDate(transaction.updatedAt)}`
                                                    }
                                                </p>
                                                {transaction.Remarks && (
                                                    <p className="text-sm text-gray-300 mt-1 italic">
                                                        "{transaction.Remarks}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getStatusColor(transaction.status)}`}>
                                                {getStatusIcon(transaction.status)}
                                                <span className="ml-2 capitalize">{transaction.status}</span>
                                            </span>
                                            <button 
                                                onClick={() => setSelectedTransaction(transaction as any)}
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                                            >
                                                <Eye className="w-4 h-4 text-gray-300" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Transaction Detail Modal */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">Transaction Details</h3>
                                <button 
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        {getTypeIcon(selectedTransaction.type, selectedTransaction.assetType)}
                                        <div>
                                            <p className="text-sm text-gray-300">Transaction Type</p>
                                            <p className="text-white font-medium capitalize">{selectedTransaction.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(selectedTransaction.status)}
                                        <div>
                                            <p className="text-sm text-gray-300">Status</p>
                                            <p className="text-white font-medium capitalize">{selectedTransaction.status}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedTransaction.assetType && (
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <p className="text-sm text-gray-300 mb-1">Asset Type</p>
                                        <div className="flex items-center gap-2">
                                            {selectedTransaction.assetType === 'cash' ? 
                                                <DollarSign className="w-4 h-4 text-green-400" /> : 
                                                <Coins className="w-4 h-4 text-yellow-400" />
                                            }
                                            <p className="text-white font-medium">{selectedTransaction.assetType.toUpperCase()}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedTransaction.amount && (
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <p className="text-sm text-gray-300 mb-1">Amount</p>
                                        <p className="text-white font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                                    </div>
                                )}

                                {selectedTransaction.quantity && (
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <p className="text-sm text-gray-300 mb-1">Quantity</p>
                                        <p className="text-white font-medium">{selectedTransaction.quantity} g</p>
                                    </div>
                                )}

                                {selectedTransaction.type === 'swapping' && (selectedTransaction.fromLocation || selectedTransaction.toLocation) && (
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <p className="text-sm text-gray-300 mb-2">Branch Transfer</p>
                                        {selectedTransaction.fromLocation && (
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-400">From:</p>
                                                <p className="text-white">{selectedTransaction.fromLocation.branchName}</p>
                                                <p className="text-sm text-gray-300">Code: {selectedTransaction.fromLocation.branchCode}</p>
                                            </div>
                                        )}
                                        {selectedTransaction.toLocation && (
                                            <div>
                                                <p className="text-xs text-gray-400">To:</p>
                                                <p className="text-white">{selectedTransaction.toLocation.branchName}</p>
                                                <p className="text-sm text-gray-300">Code: {selectedTransaction.toLocation.branchCode}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-sm text-gray-300 mb-1">Created</p>
                                    <p className="text-white font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                                    {selectedTransaction.updatedAt && selectedTransaction.updatedAt !== selectedTransaction.createdAt && (
                                        <>
                                            <p className="text-sm text-gray-300 mb-1 mt-2">Last Updated</p>
                                            <p className="text-white font-medium">{formatDate(selectedTransaction.updatedAt)}</p>
                                        </>
                                    )}
                                </div>

                                {selectedTransaction.Remarks && (
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <p className="text-sm text-gray-300 mb-1">Remarks</p>
                                        <p className="text-white italic">"{selectedTransaction.Remarks}"</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setSelectedTransaction(null)}
                                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;