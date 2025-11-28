import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

// Types
export interface Warehouse {
  id: number;
  name: string;
  location: string;
  description?: string;
  capacity?: number;
  currentOccupancy?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  unit?: string;
  minStockLevel?: number;
  warehouseId: number;
  warehouseName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER' | 'DAMAGED' | 'RESERVATION';
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface Reservation {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
  expiresAt: string;
  reservedBy?: string;
  reference?: string;
  notes?: string;
  expired: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Functions
export const warehouseApi = {
  getAll: () => apiClient.get<Warehouse[]>('/warehouses'),
  getById: (id: number) => apiClient.get<Warehouse>(`/warehouses/${id}`),
  create: (data: Partial<Warehouse>) => apiClient.post<Warehouse>('/warehouses', data),
  update: (id: number, data: Partial<Warehouse>) => apiClient.put<Warehouse>(`/warehouses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/warehouses/${id}`),
};

export const productApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
  getByWarehouse: (warehouseId: number) => apiClient.get<Product[]>(`/products/warehouse/${warehouseId}`),
  create: (data: Partial<Product>) => apiClient.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => apiClient.put<Product>(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

export const transactionApi = {
  getAll: () => apiClient.get<Transaction[]>('/transactions'),
  getById: (id: number) => apiClient.get<Transaction>(`/transactions/${id}`),
  getByProduct: (productId: number) => apiClient.get<Transaction[]>(`/transactions/product/${productId}`),
  create: (data: Partial<Transaction>) => apiClient.post<Transaction>('/transactions', data),
};

export const reservationApi = {
  getAll: () => apiClient.get<Reservation[]>('/reservations'),
  getById: (id: number) => apiClient.get<Reservation>(`/reservations/${id}`),
  getByProduct: (productId: number) => apiClient.get<Reservation[]>(`/reservations/product/${productId}`),
  create: (data: Partial<Reservation>) => apiClient.post<Reservation>('/reservations', data),
  confirm: (id: number) => apiClient.post<Reservation>(`/reservations/${id}/confirm`),
  cancel: (id: number) => apiClient.post<Reservation>(`/reservations/${id}/cancel`),
  fulfill: (id: number) => apiClient.post<Reservation>(`/reservations/${id}/fulfill`),
};
