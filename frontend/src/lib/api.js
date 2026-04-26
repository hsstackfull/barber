import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://barber0.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Adiciona token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH ====================
export const login = (data) => api.post('/api/v1/auth/login', data);
export const register = (data) => api.post('/api/v1/auth/register', data);
export const getMe = () => api.get('/api/v1/auth/me');
export const logout = (token) => api.post('/api/v1/auth/logout', { token });

// ==================== SERVICES ====================
export const getServices = () => api.get('/api/v1/services');
export const getService = (id) => api.get(`/api/v1/services/${id}`);
export const createService = (data) => api.post('/api/v1/services', data);
export const updateService = (id, data) => api.put(`/api/v1/services/${id}`, data);
export const deleteService = (id) => api.delete(`/api/v1/services/${id}`);

// ==================== PRODUCTS ====================
export const getProducts = (category = null) => 
  api.get('/api/v1/products', { params: category ? { category } : {} });
export const getProduct = (id) => api.get(`/api/v1/products/${id}`);
export const getCategories = () => api.get('/api/v1/products/categories');
export const getLowStockProducts = () => api.get('/api/v1/products/low-stock');
export const createProduct = (data) => api.post('/api/v1/products', data);
export const updateProduct = (id, data) => api.put(`/api/v1/products/${id}`, data);
export const adjustStock = (id, adjustment) => 
  api.post(`/api/v1/products/${id}/adjust-stock`, null, { params: { adjustment } });

// ==================== APPOINTMENTS ====================
export const getAppointments = (params) => api.get('/api/v1/appointments', { params });
export const getAvailableSlots = (date, serviceId) => 
  api.get('/api/v1/appointments/available-slots', { params: { date, service_id: serviceId } });
export const createAppointment = (data) => api.post('/api/v1/appointments', data);
export const updateAppointmentStatus = (id, status) => 
  api.put(`/api/v1/appointments/${id}/status`, null, { params: { status } });

// ==================== ORDERS ====================
export const getOrders = (status) => 
  api.get('/api/v1/orders', { params: status ? { status } : {} });
export const createOrder = (data) => api.post('/api/v1/orders', data);
export const updateOrderStatus = (id, status) => 
  api.put(`/api/v1/orders/${id}/status`, null, { params: { status } });

// ==================== ADMIN ====================
export const getDashboardStats = () => api.get('/api/v1/admin/dashboard');
export const getPopularServices = (limit = 5) => 
  api.get('/api/v1/admin/dashboard/popular-services', { params: { limit } });
export const getRevenueChart = (days = 7) => 
  api.get('/api/v1/admin/dashboard/revenue-chart', { params: { days } });
export const getAdminSettings = () => api.get('/api/v1/admin/settings');
export const updateAdminSettings = (data) => api.post('/api/v1/admin/settings', data);
export const getCustomers = () => api.get('/api/v1/admin/customers');

export default api;
