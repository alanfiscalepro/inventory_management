'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { productApi, warehouseApi, transactionApi, reservationApi, type Product, type Warehouse } from '@/lib/api';
//еуые сщььуе
export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: '',
    minStockLevel: '',
    warehouseId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedProductForTransaction, setSelectedProductForTransaction] = useState<Product | null>(null);
  const [transactionFormData, setTransactionFormData] = useState({
    type: 'INBOUND' as 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER' | 'DAMAGED' | 'RESERVATION',
    quantity: '',
    reference: '',
    notes: '',
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string, string>>({});

  // Reservation modal state
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProductForReservation, setSelectedProductForReservation] = useState<Product | null>(null);
  const [reservationFormData, setReservationFormData] = useState({
    quantity: '',
    expiresAt: '',
    reservedBy: '',
    reference: '',
    notes: '',
  });
  const [reservationFormErrors, setReservationFormErrors] = useState<Record<string, string>>({});

  // View Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, warehousesRes] = await Promise.all([
        productApi.getAll(),
        warehouseApi.getAll()
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesWarehouse = selectedWarehouse === 'all' || product.warehouseId.toString() === selectedWarehouse;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWarehouse && matchesSearch;
  });

  const getStockStatus = (product: Product) => {
    if (!product.minStockLevel) return 'normal';
    if (product.availableQuantity === 0) return 'out';
    if (product.availableQuantity < product.minStockLevel) return 'low';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'var(--error)';
      case 'low': return 'var(--warning)';
      default: return 'var(--success)';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'out': return 'Out of Stock';
      case 'low': return 'Low Stock';
      default: return 'In Stock';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.warehouseId) errors.warehouseId = 'Warehouse is required';

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price < 0) {
      errors.price = 'Valid price is required';
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 0) {
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
      const productData = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        unit: formData.unit.trim() || undefined,
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : undefined,
        warehouseId: parseInt(formData.warehouseId),
        active: true,
      };

      await productApi.create(productData);

      // Reset form
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        unit: '',
        minStockLevel: '',
        warehouseId: '',
      });
      setShowAddModal(false);

      // Reload products
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View Details handler
  const openDetailsModal = (product: Product) => {
    setSelectedProductForDetails(product);
    setShowDetailsModal(true);
  };

  // Transaction handlers
  const openTransactionModal = (product: Product) => {
    setSelectedProductForTransaction(product);
    setTransactionFormData({
      type: 'INBOUND',
      quantity: '',
      reference: '',
      notes: '',
    });
    setTransactionFormErrors({});
    setShowTransactionModal(true);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const quantity = parseInt(transactionFormData.quantity);
    if (!transactionFormData.quantity || isNaN(quantity) || quantity <= 0) {
      errors.quantity = 'Valid quantity is required';
    }
    setTransactionFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await transactionApi.create({
        productId: selectedProductForTransaction!.id,
        type: transactionFormData.type,
        quantity: parseInt(transactionFormData.quantity),
        reference: transactionFormData.reference.trim() || undefined,
        notes: transactionFormData.notes.trim() || undefined,
      });

      setShowTransactionModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reservation handlers
  const openReservationModal = (product: Product) => {
    setSelectedProductForReservation(product);
    setReservationFormData({
      quantity: '',
      expiresAt: '',
      reservedBy: '',
      reference: '',
      notes: '',
    });
    setReservationFormErrors({});
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const quantity = parseInt(reservationFormData.quantity);
    if (!reservationFormData.quantity || isNaN(quantity) || quantity <= 0) {
      errors.quantity = 'Valid quantity is required';
    }
    if (!reservationFormData.expiresAt) {
      errors.expiresAt = 'Expiration date is required';
    } else {
      const expiresDate = new Date(reservationFormData.expiresAt);
      if (expiresDate <= new Date()) {
        errors.expiresAt = 'Expiration date must be in the future';
      }
    }
    setReservationFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await reservationApi.create({
        productId: selectedProductForReservation!.id,
        quantity: parseInt(reservationFormData.quantity),
        expiresAt: new Date(reservationFormData.expiresAt).toISOString(),
        reservedBy: reservationFormData.reservedBy.trim() || undefined,
        reference: reservationFormData.reference.trim() || undefined,
        notes: reservationFormData.notes.trim() || undefined,
      });

      setShowReservationModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[var(--text-secondary)] text-lg">Loading products...</p>
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
                  Products
                </h1>
                <p className="text-[var(--text-secondary)] text-base font-mono">
                  &gt; MANAGE INVENTORY PRODUCTS
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
                Add Product
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
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="md:w-72">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
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

        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">No products found</h3>
            <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-md mx-auto">
              {searchQuery || selectedWarehouse !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && selectedWarehouse === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-4 bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-semibold text-base rounded-lg hover:scale-105 transition-all shadow-lg"
              >
                Add Your First Product
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredProducts.map((product, index) => {
              const status = getStockStatus(product);
              const warehouse = warehouses.find(w => w.id === product.warehouseId);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-10 hover:border-[var(--accent-cyan)]/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-6 mb-6">
                        <div className="w-20 h-20 rounded-xl bg-[var(--accent-cyan)]/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-10 h-10 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <h3 className="text-3xl font-bold text-[var(--text-primary)]">{product.name}</h3>
                          <p className="text-[var(--text-secondary)] font-mono text-base">SKU: {product.sku}</p>
                          {product.description && (
                            <p className="text-[var(--text-tertiary)] text-base mt-3 leading-relaxed">{product.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg">
                          <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-[var(--text-secondary)] text-base font-medium">{warehouse?.name || 'Unknown'}</span>
                        </div>
                        {product.unit && (
                          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg">
                            <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-[var(--text-secondary)] text-base font-medium">{product.unit}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg">
                          <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[var(--text-secondary)] text-base font-medium">${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div className="flex flex-row lg:flex-col gap-8 lg:gap-6 lg:items-end">
                      <div className="text-center lg:text-right space-y-2">
                        <div className="text-base text-[var(--text-tertiary)] font-medium">Available</div>
                        <div className="text-5xl font-bold font-mono leading-none" style={{ color: getStockStatusColor(status) }}>
                          {product.availableQuantity}
                        </div>
                      </div>
                      <div className="text-center lg:text-right space-y-2">
                        <div className="text-base text-[var(--text-tertiary)] font-medium">Reserved</div>
                        <div className="text-3xl font-bold text-[var(--info)] font-mono leading-none">
                          {product.reservedQuantity}
                        </div>
                      </div>
                      <div className="text-center lg:text-right space-y-2">
                        <div className="text-base text-[var(--text-tertiary)] font-medium mb-3">Status</div>
                        <span
                          className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
                          style={{
                            backgroundColor: `${getStockStatusColor(status)}20`,
                            color: getStockStatusColor(status),
                            border: `2px solid ${getStockStatusColor(status)}40`
                          }}
                        >
                          {getStockStatusText(status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => openDetailsModal(product)}
                      className="flex-1 px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:border-[var(--accent-cyan)] hover:bg-[var(--bg-hover)] transition-all text-base font-semibold"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openTransactionModal(product)}
                      className="flex-1 px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:border-[var(--accent-amber)] hover:bg-[var(--bg-hover)] transition-all text-base font-semibold"
                    >
                      New Transaction
                    </button>
                    <button
                      onClick={() => openReservationModal(product)}
                      className="flex-1 px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:border-[var(--info)] hover:bg-[var(--bg-hover)] transition-all text-base font-semibold"
                    >
                      Reserve
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                Add Product
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
              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  SKU <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.sku ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="e.g., PROD-001"
                />
                {formErrors.sku && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.sku}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Product Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.name ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="e.g., Laptop Stand"
                />
                {formErrors.name && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base resize-none"
                  placeholder="Product description..."
                />
              </div>

              {/* Price and Quantity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                    Price ($) <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                      formErrors.price ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                    } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="mt-2 text-[var(--error)] text-sm">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                    Initial Quantity <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                      formErrors.quantity ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                    } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                    placeholder="0"
                  />
                  {formErrors.quantity && (
                    <p className="mt-2 text-[var(--error)] text-sm">{formErrors.quantity}</p>
                  )}
                </div>
              </div>

              {/* Unit and Min Stock Level Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="unit" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                    Unit
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                    placeholder="e.g., pcs, kg, box"
                  />
                </div>

                <div>
                  <label htmlFor="minStockLevel" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    id="minStockLevel"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Warehouse */}
              <div>
                <label htmlFor="warehouseId" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Warehouse <span className="text-[var(--error)]">*</span>
                </label>
                <select
                  id="warehouseId"
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.warehouseId ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer text-base`}
                >
                  <option value="">Select a warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.location}
                    </option>
                  ))}
                </select>
                {formErrors.warehouseId && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.warehouseId}</p>
                )}
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
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* New Transaction Modal */}
      {showTransactionModal && selectedProductForTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransactionModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  New Transaction
                </h2>
                <p className="text-[var(--text-secondary)] text-base mt-2">
                  {selectedProductForTransaction.name} ({selectedProductForTransaction.sku})
                </p>
              </div>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
              >
                <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-6">
              <div>
                <label htmlFor="transactionType" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Transaction Type <span className="text-[var(--error)]">*</span>
                </label>
                <select
                  id="transactionType"
                  value={transactionFormData.type}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors cursor-pointer text-base"
                >
                  <option value="INBOUND">Inbound - Stock received</option>
                  <option value="OUTBOUND">Outbound - Stock shipped/sold</option>
                  <option value="RETURN">Return - Product returned</option>
                  <option value="ADJUSTMENT">Adjustment - Manual correction</option>
                  <option value="TRANSFER">Transfer - Between warehouses</option>
                  <option value="DAMAGED">Damaged - Damaged/lost items</option>
                  <option value="RESERVATION">Reservation - Reserved stock</option>
                </select>
              </div>

              <div>
                <label htmlFor="transactionQuantity" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Quantity <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="number"
                  id="transactionQuantity"
                  value={transactionFormData.quantity}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  min="1"
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    transactionFormErrors.quantity ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="Enter quantity"
                />
                {transactionFormErrors.quantity && (
                  <p className="mt-2 text-[var(--error)] text-sm">{transactionFormErrors.quantity}</p>
                )}
              </div>

              <div>
                <label htmlFor="transactionReference" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Reference Number
                </label>
                <input
                  type="text"
                  id="transactionReference"
                  value={transactionFormData.reference}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                  placeholder="e.g., PO-12345"
                />
              </div>

              <div>
                <label htmlFor="transactionNotes" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Notes
                </label>
                <textarea
                  id="transactionNotes"
                  value={transactionFormData.notes}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
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

      {/* New Reservation Modal */}
      {showReservationModal && selectedProductForReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowReservationModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Reserve Stock
                </h2>
                <p className="text-[var(--text-secondary)] text-base mt-2">
                  {selectedProductForReservation.name} ({selectedProductForReservation.sku})
                </p>
                <p className="text-[var(--text-tertiary)] text-sm mt-1">
                  Available: {selectedProductForReservation.availableQuantity}
                </p>
              </div>
              <button
                onClick={() => setShowReservationModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
              >
                <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReservationSubmit} className="space-y-6">
              <div>
                <label htmlFor="reservationQuantity" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Quantity <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="number"
                  id="reservationQuantity"
                  value={reservationFormData.quantity}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  min="1"
                  max={selectedProductForReservation.availableQuantity}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    reservationFormErrors.quantity ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="Quantity to reserve"
                />
                {reservationFormErrors.quantity && (
                  <p className="mt-2 text-[var(--error)] text-sm">{reservationFormErrors.quantity}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservationExpiresAt" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Expiration Date & Time <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="reservationExpiresAt"
                  value={reservationFormData.expiresAt}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    reservationFormErrors.expiresAt ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                />
                {reservationFormErrors.expiresAt && (
                  <p className="mt-2 text-[var(--error)] text-sm">{reservationFormErrors.expiresAt}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservationReservedBy" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Reserved By
                </label>
                <input
                  type="text"
                  id="reservationReservedBy"
                  value={reservationFormData.reservedBy}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, reservedBy: e.target.value }))}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                  placeholder="Person or organization name"
                />
              </div>

              <div>
                <label htmlFor="reservationReference" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Reference Number
                </label>
                <input
                  type="text"
                  id="reservationReference"
                  value={reservationFormData.reference}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base"
                  placeholder="e.g., ORDER-12345"
                />
              </div>

              <div>
                <label htmlFor="reservationNotes" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Notes
                </label>
                <textarea
                  id="reservationNotes"
                  value={reservationFormData.notes}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base resize-none"
                  placeholder="Additional notes about this reservation..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
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

      {/* View Details Modal */}
      {showDetailsModal && selectedProductForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                Product Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
              >
                <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Header Info */}
              <div className="flex items-start gap-6 pb-8 border-b border-[var(--border-color)]">
                <div className="w-24 h-24 rounded-xl bg-[var(--accent-cyan)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-12 h-12 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{selectedProductForDetails.name}</h3>
                  <p className="text-[var(--text-secondary)] font-mono text-lg">SKU: {selectedProductForDetails.sku}</p>
                  {selectedProductForDetails.description && (
                    <p className="text-[var(--text-tertiary)] mt-4 text-base leading-relaxed">{selectedProductForDetails.description}</p>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4">Stock Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-6">
                    <div className="text-sm text-[var(--text-tertiary)] mb-2">Total Quantity</div>
                    <div className="text-3xl font-bold text-[var(--text-primary)] font-mono">{selectedProductForDetails.quantity}</div>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-6">
                    <div className="text-sm text-[var(--text-tertiary)] mb-2">Available</div>
                    <div className="text-3xl font-bold text-[var(--success)] font-mono">{selectedProductForDetails.availableQuantity}</div>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-6">
                    <div className="text-sm text-[var(--text-tertiary)] mb-2">Reserved</div>
                    <div className="text-3xl font-bold text-[var(--info)] font-mono">{selectedProductForDetails.reservedQuantity}</div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-[var(--bg-tertiary)] rounded-lg p-6">
                    <svg className="w-6 h-6 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-[var(--text-tertiary)]">Price</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">${selectedProductForDetails.price.toFixed(2)}</div>
                    </div>
                  </div>

                  {selectedProductForDetails.unit && (
                    <div className="flex items-center gap-4 bg-[var(--bg-tertiary)] rounded-lg p-6">
                      <svg className="w-6 h-6 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <div>
                        <div className="text-sm text-[var(--text-tertiary)]">Unit</div>
                        <div className="text-xl font-bold text-[var(--text-primary)]">{selectedProductForDetails.unit}</div>
                      </div>
                    </div>
                  )}

                  {selectedProductForDetails.minStockLevel && (
                    <div className="flex items-center gap-4 bg-[var(--bg-tertiary)] rounded-lg p-6">
                      <svg className="w-6 h-6 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <div className="text-sm text-[var(--text-tertiary)]">Min Stock Level</div>
                        <div className="text-xl font-bold text-[var(--warning)]">{selectedProductForDetails.minStockLevel}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 bg-[var(--bg-tertiary)] rounded-lg p-6">
                    <svg className="w-6 h-6 text-[var(--accent-amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <div className="text-sm text-[var(--text-tertiary)]">Warehouse</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">
                        {warehouses.find(w => w.id === selectedProductForDetails.warehouseId)?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Timestamps */}
              <div className="pt-6 border-t border-[var(--border-color)]">
                <div className="flex flex-wrap gap-6 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Status: <span className={selectedProductForDetails.active ? 'text-[var(--success)]' : 'text-[var(--error)]'}>{selectedProductForDetails.active ? 'Active' : 'Inactive'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created: {new Date(selectedProductForDetails.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Updated: {new Date(selectedProductForDetails.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openTransactionModal(selectedProductForDetails);
                  }}
                  className="flex-1 px-8 py-4 bg-[var(--accent-amber)]/20 border-2 border-[var(--accent-amber)]/40 text-[var(--accent-amber)] rounded-lg hover:bg-[var(--accent-amber)]/30 transition-all font-semibold text-base"
                >
                  New Transaction
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openReservationModal(selectedProductForDetails);
                  }}
                  className="flex-1 px-8 py-4 bg-[var(--info)]/20 border-2 border-[var(--info)]/40 text-[var(--info)] rounded-lg hover:bg-[var(--info)]/30 transition-all font-semibold text-base"
                >
                  Reserve Stock
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-8 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--border-accent)] transition-all font-semibold text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
