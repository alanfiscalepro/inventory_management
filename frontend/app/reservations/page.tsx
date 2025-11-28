'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { reservationApi, productApi, type Reservation, type Product } from '@/lib/api';

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    expiresAt: '',
    reservedBy: '',
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
      const [reservationsRes, productsRes] = await Promise.all([
        reservationApi.getAll(),
        productApi.getAll()
      ]);
      setReservations(reservationsRes.data);
      setProducts(productsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const matchesSearch =
      reservation.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.reservedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      errors.quantity = 'Valid quantity is required';
    }

    if (!formData.expiresAt) {
      errors.expiresAt = 'Expiration date is required';
    } else {
      const expiresDate = new Date(formData.expiresAt);
      if (expiresDate <= new Date()) {
        errors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const reservationData = {
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        reservedBy: formData.reservedBy.trim() || undefined,
        reference: formData.reference.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await reservationApi.create(reservationData);

      setFormData({
        productId: '',
        quantity: '',
        expiresAt: '',
        reservedBy: '',
        reference: '',
        notes: '',
      });
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (reservationId: number, action: 'confirm' | 'cancel' | 'fulfill') => {
    try {
      setError(null);
      if (action === 'confirm') {
        await reservationApi.confirm(reservationId);
      } else if (action === 'cancel') {
        await reservationApi.cancel(reservationId);
      } else if (action === 'fulfill') {
        await reservationApi.fulfill(reservationId);
      }
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} reservation`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'var(--warning)';
      case 'CONFIRMED': return 'var(--info)';
      case 'FULFILLED': return 'var(--success)';
      case 'CANCELLED': return 'var(--error)';
      default: return 'var(--text-tertiary)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      case 'CONFIRMED':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      case 'FULFILLED':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        );
      case 'CANCELLED':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <p className="text-[var(--text-secondary)] text-lg">Loading reservations...</p>
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
                  Reservations
                </h1>
                <p className="text-[var(--text-secondary)] text-base font-mono">
                  &gt; MANAGE STOCK RESERVATIONS
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
                New Reservation
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
                  placeholder="Search reservations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="md:w-72">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="CANCELLED">Cancelled</option>
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

        {filteredReservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">No reservations found</h3>
            <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first reservation'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-4 bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-semibold text-base rounded-lg hover:scale-105 transition-all shadow-lg"
              >
                Create First Reservation
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReservations.map((reservation, index) => {
              const statusColor = getStatusColor(reservation.status);

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-10 hover:border-[var(--accent-cyan)]/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${statusColor}20` }}
                      >
                        <svg className="w-10 h-10" fill="none" stroke={statusColor} viewBox="0 0 24 24">
                          {getStatusIcon(reservation.status)}
                        </svg>
                      </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <span
                          className="px-5 py-2.5 rounded-lg text-sm font-bold"
                          style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                            border: `2px solid ${statusColor}40`
                          }}
                        >
                          {reservation.status}
                        </span>
                        <h3 className="text-3xl font-bold text-[var(--text-primary)]">
                          {reservation.productName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-6 text-[var(--text-secondary)] text-base">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-mono">{reservation.productSku}</span>
                        </div>

                        {reservation.reservedBy && (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{reservation.reservedBy}</span>
                          </div>
                        )}

                        {reservation.reference && (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{reservation.reference}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Expires: {new Date(reservation.expiresAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {reservation.notes && (
                        <p className="text-[var(--text-tertiary)] text-base leading-relaxed">
                          {reservation.notes}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base text-[var(--text-tertiary)] font-medium mb-2">Reserved</div>
                      <div className="text-5xl font-bold font-mono text-[var(--accent-cyan)]">
                        {reservation.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {reservation.status !== 'FULFILLED' && reservation.status !== 'CANCELLED' && (
                    <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-4">
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'confirm')}
                          className="flex-1 px-6 py-4 bg-[var(--info)]/20 border-2 border-[var(--info)]/40 text-[var(--info)] rounded-lg hover:bg-[var(--info)]/30 transition-all text-base font-semibold"
                        >
                          Confirm Reservation
                        </button>
                      )}
                      {reservation.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'fulfill')}
                          className="flex-1 px-6 py-4 bg-[var(--success)]/20 border-2 border-[var(--success)]/40 text-[var(--success)] rounded-lg hover:bg-[var(--success)]/30 transition-all text-base font-semibold"
                        >
                          Fulfill Reservation
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'cancel')}
                        className="flex-1 px-6 py-4 bg-[var(--error)]/20 border-2 border-[var(--error)]/40 text-[var(--error)] rounded-lg hover:bg-[var(--error)]/30 transition-all text-base font-semibold"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* Add Reservation Modal */}
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
                New Reservation
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
                      {product.name} ({product.sku}) - Available: {product.availableQuantity}
                    </option>
                  ))}
                </select>
                {formErrors.productId && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.productId}</p>
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
                  placeholder="Enter quantity to reserve"
                />
                {formErrors.quantity && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.quantity}</p>
                )}
              </div>

              {/* Expires At */}
              <div>
                <label htmlFor="expiresAt" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Expiration Date & Time <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.expiresAt ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                />
                {formErrors.expiresAt && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.expiresAt}</p>
                )}
              </div>

              {/* Reserved By */}
              <div>
                <label htmlFor="reservedBy" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Reserved By
                </label>
                <input
                  type="text"
                  id="reservedBy"
                  name="reservedBy"
                  value={formData.reservedBy}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                  placeholder="Person or organization name"
                />
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
                  placeholder="e.g., ORDER-12345"
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
                  placeholder="Additional notes about this reservation..."
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
                  {isSubmitting ? 'Creating...' : 'Create Reservation'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
