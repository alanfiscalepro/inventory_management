'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { transactionApi, productApi, type Transaction, type Product } from '@/lib/api';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'INBOUND' as 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER' | 'DAMAGED' | 'RESERVATION',
    quantity: '',
    reference: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsRes, productsRes] = await Promise.all([
        transactionApi.getAll(),
        productApi.getAll()
      ]);
      setTransactions(transactionsRes.data);
      setProducts(productsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch =
      transaction.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.productId) errors.productId = 'Product is required';
    if (!formData.type) errors.type = 'Transaction type is required';

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      errors.quantity = 'Valid quantity is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const transactionData = {
        productId: parseInt(formData.productId),
        type: formData.type,
        quantity: parseInt(formData.quantity),
        reference: formData.reference.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await transactionApi.create(transactionData);

      setFormData({
        productId: '',
        type: 'INBOUND',
        quantity: '',
        reference: '',
        notes: '',
      });
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'INBOUND': return 'var(--success)';
      case 'OUTBOUND': return 'var(--error)';
      case 'RETURN': return 'var(--info)';
      case 'ADJUSTMENT': return 'var(--warning)';
      case 'DAMAGED': return 'var(--error)';
      case 'TRANSFER': return 'var(--accent-amber)';
      case 'RESERVATION': return 'var(--accent-cyan)';
      default: return 'var(--info)';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'INBOUND':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        );
      case 'OUTBOUND':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        );
      case 'RETURN':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        );
      case 'ADJUSTMENT':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        );
      case 'DAMAGED':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        );
      case 'TRANSFER':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        );
      case 'RESERVATION':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[var(--text-secondary)] text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-24">
      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(var(--accent-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--accent-cyan) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl sticky top-0"
      >
        <div className="container max-w-6xl mx-auto px-8 lg:px-12 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] hover:border-[var(--accent-cyan)] transition-all"
              >
                <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="space-y-3">
                <h1 className="text-5xl font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Transactions
                </h1>
                <p className="text-[var(--text-secondary)] text-base font-mono">
                  &gt; INVENTORY MOVEMENT HISTORY
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="group relative overflow-hidden px-8 py-4 bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-semibold rounded-lg hover:scale-105 transition-all shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Transaction
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="md:w-72">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="INBOUND">Inbound</option>
                <option value="OUTBOUND">Outbound</option>
                <option value="RETURN">Return</option>
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="TRANSFER">Transfer</option>
                <option value="DAMAGED">Damaged</option>
                <option value="RESERVATION">Reservation</option>
              </select>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 w-full">
        <div className="container max-w-6xl mx-auto px-8 lg:px-12 py-20 space-y-8">
        {error && (
          <div className="mb-8 p-8 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl">
            <p className="text-[var(--error)] text-base">{error}</p>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">No transactions found</h3>
            <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-md mx-auto">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by recording your first transaction'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-4 bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-semibold text-base rounded-lg hover:scale-105 transition-all shadow-lg"
              >
                Record First Transaction
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredTransactions.map((transaction, index) => {
              const typeColor = getTransactionTypeColor(transaction.type);

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 hover:border-[var(--accent-cyan)]/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Type Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${typeColor}20` }}
                      >
                        <svg className="w-8 h-8" fill="none" stroke={typeColor} viewBox="0 0 24 24">
                          {getTransactionTypeIcon(transaction.type)}
                        </svg>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <span
                          className="px-4 py-2 rounded-lg text-sm font-bold"
                          style={{
                            backgroundColor: `${typeColor}20`,
                            color: typeColor,
                            border: `2px solid ${typeColor}40`
                          }}
                        >
                          {transaction.type}
                        </span>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                          {transaction.productName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-6 text-[var(--text-secondary)] text-base">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-mono">{transaction.productSku}</span>
                        </div>

                        {transaction.reference && (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{transaction.reference}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {transaction.notes && (
                        <p className="text-[var(--text-tertiary)] text-base leading-relaxed">
                          {transaction.notes}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base text-[var(--text-tertiary)] font-medium mb-2">Quantity</div>
                      <div className="text-4xl font-bold font-mono" style={{ color: typeColor }}>
                        {(transaction.type === 'OUTBOUND' || transaction.type === 'DAMAGED') ? '-' : '+'}{transaction.quantity}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                New Transaction
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
              >
                <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product */}
              <div>
                <label htmlFor="productId" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Product <span className="text-[var(--error)]">*</span>
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.productId ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer text-base`}
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                {formErrors.productId && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.productId}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Transaction Type <span className="text-[var(--error)]">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.type ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer text-base`}
                >
                  <option value="INBOUND">Inbound - Stock received</option>
                  <option value="OUTBOUND">Outbound - Stock shipped/sold</option>
                  <option value="RETURN">Return - Product returned</option>
                  <option value="ADJUSTMENT">Adjustment - Manual correction</option>
                  <option value="TRANSFER">Transfer - Between warehouses</option>
                  <option value="DAMAGED">Damaged - Damaged/lost items</option>
                  <option value="RESERVATION">Reservation - Reserved stock</option>
                </select>
                {formErrors.type && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.type}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Quantity <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.quantity ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="Enter quantity"
                />
                {formErrors.quantity && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.quantity}</p>
                )}
              </div>

              {/* Reference */}
              <div>
                <label htmlFor="reference" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Reference Number
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                  placeholder="e.g., PO-12345, INV-98765"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--border-accent)] transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 bg-[var(--accent-cyan)] text-[var(--bg-primary)] rounded-lg hover:scale-105 transition-all font-semibold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Creating...' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
