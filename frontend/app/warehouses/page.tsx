'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { warehouseApi, type Warehouse } from '@/lib/api';

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    capacity: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    location: '',
    description: '',
    capacity: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseApi.getAll();
      setWarehouses(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';

    if (formData.capacity) {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < 0) {
        errors.capacity = 'Valid capacity is required';
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
      const warehouseData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        active: true,
      };

      await warehouseApi.create(warehouseData);

      setFormData({
        name: '',
        location: '',
        description: '',
        capacity: '',
      });
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailsModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailsModal(true);
  };

  const openEditModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditFormData({
      name: warehouse.name,
      location: warehouse.location,
      description: warehouse.description || '',
      capacity: warehouse.capacity?.toString() || '',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};

    if (!editFormData.name.trim()) errors.name = 'Name is required';
    if (!editFormData.location.trim()) errors.location = 'Location is required';

    if (editFormData.capacity) {
      const capacity = parseInt(editFormData.capacity);
      if (isNaN(capacity) || capacity < 0) {
        errors.capacity = 'Valid capacity is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm() || !selectedWarehouse) return;

    setIsSubmitting(true);
    try {
      const warehouseData = {
        name: editFormData.name.trim(),
        location: editFormData.location.trim(),
        description: editFormData.description.trim() || undefined,
        capacity: editFormData.capacity ? parseInt(editFormData.capacity) : undefined,
      };

      await warehouseApi.update(selectedWarehouse.id, warehouseData);

      setShowEditModal(false);
      setSelectedWarehouse(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[var(--text-secondary)] text-lg">Loading warehouses...</p>
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
                  Warehouses
                </h1>
                <p className="text-[var(--text-secondary)] text-base font-mono">
                  &gt; MANAGE STORAGE LOCATIONS
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
                Add Warehouse
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-base bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
            />
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

        {filteredWarehouses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">No warehouses found</h3>
            <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first warehouse'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-4 bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-semibold text-base rounded-lg hover:scale-105 transition-all shadow-lg"
              >
                Add Your First Warehouse
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredWarehouses.map((warehouse, index) => {
              const occupancyPercentage = warehouse.capacity && warehouse.currentOccupancy
                ? (warehouse.currentOccupancy / warehouse.capacity) * 100
                : 0;

              return (
                <motion.div
                  key={warehouse.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-10 hover:border-[var(--accent-cyan)]/50 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-20 h-20 rounded-xl bg-[var(--accent-amber)]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-10 h-10 text-[var(--accent-amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="text-3xl font-bold text-[var(--text-primary)]">{warehouse.name}</h3>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-base">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {warehouse.location}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {warehouse.description && (
                    <p className="text-[var(--text-tertiary)] text-base mb-6 leading-relaxed">
                      {warehouse.description}
                    </p>
                  )}

                  {/* Capacity Info */}
                  {warehouse.capacity && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-[var(--text-secondary)] font-medium">Capacity</span>
                        <span className="text-[var(--text-primary)] font-bold font-mono">
                          {warehouse.currentOccupancy || 0} / {warehouse.capacity}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(occupancyPercentage, 100)}%`,
                            backgroundColor: occupancyPercentage >= 90
                              ? 'var(--error)'
                              : occupancyPercentage >= 70
                              ? 'var(--warning)'
                              : 'var(--accent-cyan)'
                          }}
                        />
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)] font-mono">
                        {occupancyPercentage.toFixed(1)}% utilized
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mb-6">
                    <span
                      className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
                      style={{
                        backgroundColor: warehouse.active ? 'var(--success)20' : 'var(--text-tertiary)20',
                        color: warehouse.active ? 'var(--success)' : 'var(--text-tertiary)',
                        border: `2px solid ${warehouse.active ? 'var(--success)40' : 'var(--text-tertiary)40'}`
                      }}
                    >
                      {warehouse.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => openDetailsModal(warehouse)}
                      className="flex-1 px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:border-[var(--accent-cyan)] hover:bg-[var(--bg-hover)] transition-all text-base font-semibold"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openEditModal(warehouse)}
                      className="flex-1 px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:border-[var(--accent-amber)] hover:bg-[var(--bg-hover)] transition-all text-base font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* Add Warehouse Modal */}
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
                Add Warehouse
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
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Warehouse Name <span className="text-[var(--error)]">*</span>
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
                  placeholder="e.g., Main Warehouse"
                />
                {formErrors.name && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.name}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Location <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.location ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="e.g., New York, NY"
                />
                {formErrors.location && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.location}</p>
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
                  placeholder="Warehouse description..."
                />
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.capacity ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="Maximum storage capacity"
                />
                {formErrors.capacity && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.capacity}</p>
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
                  {isSubmitting ? 'Creating...' : 'Create Warehouse'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-[var(--accent-amber)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-[var(--accent-amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {selectedWarehouse.name}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-base mt-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedWarehouse.location}
                  </p>
                </div>
              </div>
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
              {/* Description */}
              {selectedWarehouse.description && (
                <div>
                  <h3 className="text-[var(--text-secondary)] font-semibold mb-3 text-sm uppercase tracking-wider">Description</h3>
                  <p className="text-[var(--text-primary)] text-base leading-relaxed">{selectedWarehouse.description}</p>
                </div>
              )}

              {/* Capacity Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 border border-[var(--border-color)]">
                  <h3 className="text-[var(--text-secondary)] font-semibold mb-2 text-sm">Capacity</h3>
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-mono">
                    {selectedWarehouse.capacity?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 border border-[var(--border-color)]">
                  <h3 className="text-[var(--text-secondary)] font-semibold mb-2 text-sm">Current Occupancy</h3>
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-mono">
                    {selectedWarehouse.currentOccupancy?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-[var(--text-secondary)] font-semibold mb-2 text-sm">Status</h3>
                  <span
                    className="inline-block px-4 py-2 rounded-lg text-sm font-bold"
                    style={{
                      backgroundColor: selectedWarehouse.active ? 'var(--success)20' : 'var(--text-tertiary)20',
                      color: selectedWarehouse.active ? 'var(--success)' : 'var(--text-tertiary)',
                      border: `2px solid ${selectedWarehouse.active ? 'var(--success)40' : 'var(--text-tertiary)40'}`
                    }}
                  >
                    {selectedWarehouse.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <h3 className="text-[var(--text-secondary)] font-semibold mb-2 text-sm">Created</h3>
                  <p className="text-[var(--text-primary)] text-sm">
                    {new Date(selectedWarehouse.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-[var(--text-secondary)] font-semibold mb-2 text-sm">Updated</h3>
                  <p className="text-[var(--text-primary)] text-sm">
                    {new Date(selectedWarehouse.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedWarehouse);
                  }}
                  className="flex-1 px-8 py-4 bg-[var(--accent-amber)] text-[var(--bg-primary)] rounded-lg hover:scale-105 transition-all font-semibold text-base shadow-lg"
                >
                  Edit Warehouse
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-8 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all font-semibold text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Warehouse Modal */}
      {showEditModal && selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-12 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                Edit Warehouse
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors"
              >
                <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="edit-name" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Warehouse Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.name ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="e.g., Main Warehouse"
                />
                {formErrors.name && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.name}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="edit-location" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Location <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="edit-location"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.location ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="e.g., New York, NY"
                />
                {formErrors.location && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.location}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-description" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base resize-none"
                  placeholder="Warehouse description..."
                />
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="edit-capacity" className="block text-[var(--text-primary)] font-semibold mb-3 text-base">
                  Capacity
                </label>
                <input
                  type="number"
                  id="edit-capacity"
                  name="capacity"
                  value={editFormData.capacity}
                  onChange={handleEditInputChange}
                  min="0"
                  className={`w-full px-6 py-4 bg-[var(--bg-tertiary)] border ${
                    formErrors.capacity ? 'border-[var(--error)]' : 'border-[var(--border-color)]'
                  } rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors text-base`}
                  placeholder="Maximum storage capacity"
                />
                {formErrors.capacity && (
                  <p className="mt-2 text-[var(--error)] text-sm">{formErrors.capacity}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--border-accent)] transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 bg-[var(--accent-amber)] text-[var(--bg-primary)] rounded-lg hover:scale-105 transition-all font-semibold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Updating...' : 'Update Warehouse'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
