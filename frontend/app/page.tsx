'use client';

import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses();
  const { data: products, isLoading: productsLoading } = useProducts();

  const totalProducts = products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
  const lowStockProducts = products?.filter(p => p.quantity < (p.minStockLevel || 0)).length || 0;
  const activeReservations = products?.reduce((sum, p) => sum + p.reservedQuantity, 0) || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen relative pb-24">
      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(var(--accent-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--accent-cyan) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl sticky top-0"
      >
        <div className="max-w-[1200px] mx-auto px-8 lg:px-12 py-8">
          <div className="flex items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--info)] rounded-lg flex items-center justify-center transform -rotate-6">
                  <svg className="w-6 h-6 text-[var(--bg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-[var(--accent-cyan)]">WAREHOUSE</span>
                  <span className="text-[var(--text-primary)]"> CONTROL</span>
                </h1>
              </div>
              <p className="text-[var(--text-secondary)] text-sm font-mono ml-[52px]">
                &gt; INDUSTRIAL INVENTORY MANAGEMENT SYSTEM
              </p>
            </div>
            <nav className="flex gap-3">
              <Link href="/warehouses" className="group px-5 py-2.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all border border-[var(--border-color)] hover:border-[var(--accent-cyan)]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] relative overflow-hidden">
                <span className="relative z-10">Warehouses</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)]/0 via-[var(--accent-cyan)]/5 to-[var(--accent-cyan)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
              <Link href="/products" className="group px-5 py-2.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all border border-[var(--border-color)] hover:border-[var(--accent-amber)]/50 hover:shadow-[0_0_20px_rgba(255,176,32,0.1)] relative overflow-hidden">
                <span className="relative z-10">Products</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-amber)]/0 via-[var(--accent-amber)]/5 to-[var(--accent-amber)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
              <Link href="/transactions" className="group px-5 py-2.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all border border-[var(--border-color)] hover:border-[var(--success)]/50 hover:shadow-[0_0_20px_rgba(0,229,153,0.1)] relative overflow-hidden">
                <span className="relative z-10">Transactions</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--success)]/0 via-[var(--success)]/5 to-[var(--success)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
              <Link href="/reservations" className="group px-5 py-2.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all border border-[var(--border-color)] hover:border-[var(--info)]/50 hover:shadow-[0_0_20px_rgba(77,166,255,0.1)] relative overflow-hidden">
                <span className="relative z-10">Reservations</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--info)]/0 via-[var(--info)]/5 to-[var(--info)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 w-full">
        <div className="container max-w-6xl mx-auto">
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-5"
        >
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"></div>
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 hover:border-[var(--accent-cyan)]/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[var(--text-tertiary)] uppercase text-xs font-mono tracking-wider">Warehouses</div>
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold text-[var(--text-primary)] font-mono mb-3">
                {warehousesLoading ? '...' : warehouses?.length || 0}
              </div>
              <div className="text-[var(--text-secondary)] text-sm">Active facilities</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-amber)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"></div>
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 hover:border-[var(--accent-amber)]/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[var(--text-tertiary)] uppercase text-xs font-mono tracking-wider">Total Stock</div>
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-amber)]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--accent-amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold text-[var(--text-primary)] font-mono mb-3">
                {productsLoading ? '...' : totalProducts.toLocaleString()}
              </div>
              <div className="text-[var(--text-secondary)] text-sm">Units in inventory</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--error)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"></div>
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 hover:border-[var(--error)]/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[var(--text-tertiary)] uppercase text-xs font-mono tracking-wider">Low Stock</div>
                <div className="w-12 h-12 rounded-lg bg-[var(--error)]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold text-[var(--text-primary)] font-mono mb-3">
                {productsLoading ? '...' : lowStockProducts}
              </div>
              <div className="text-[var(--text-secondary)] text-sm">Products need restocking</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--info)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"></div>
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 hover:border-[var(--info)]/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[var(--text-tertiary)] uppercase text-xs font-mono tracking-wider">Reserved</div>
                <div className="w-12 h-12 rounded-lg bg-[var(--info)]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold text-[var(--text-primary)] font-mono mb-3">
                {productsLoading ? '...' : activeReservations.toLocaleString()}
              </div>
              <div className="text-[var(--text-secondary)] text-sm">Units reserved</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-10 mt-5"
        >
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products" className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-8 hover:border-[var(--accent-cyan)] transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-[var(--accent-cyan)] mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Add Product</h3>
                <p className="text-[var(--text-secondary)] text-sm">Create new inventory item</p>
              </div>
            </Link>

            <Link href="/transactions" className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-8 hover:border-[var(--accent-amber)] transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-amber)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-[var(--accent-amber)] mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">New Transaction</h3>
                <p className="text-[var(--text-secondary)] text-sm">Record stock movement</p>
              </div>
            </Link>

            <Link href="/reservations" className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-8 hover:border-[var(--info)] transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--info)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-[var(--info)] mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Create Reservation</h3>
                <p className="text-[var(--text-secondary)] text-sm">Reserve stock for orders</p>
              </div>
            </Link>
          </div>
        </motion.div>
        </div>
      </main>
    </div>
  );
}
