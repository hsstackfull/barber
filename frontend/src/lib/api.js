import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Adicione isto para suportar autenticação se necessário
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services
export const getServices = () => api.get('/api/services');
export const getService = (id) => api.get(`/api/services/${id}`);
export const createService = (data) => api.post('/api/services', data);
export const updateService = (id, data) => api.put(`/api/services/${id}`, data);
export const deleteService = (id) => api.delete(`/api/services/${id}`);

// Products
export const getProducts = (category) => 
  api.get('/api/products', { params: category ? { category } : {} });
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const getCategories = () => api.get('/api/products/categories');
export const getLowStockProducts = () => api.get('/api/products/low-stock');
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const adjustStock = (id, adjustment) => 
  api.post(`/api/products/${id}/adjust-stock`, null, { params: { adjustment } });

// Appointments
export const getAppointments = (params) => api.get('/api/appointments', { params });
export const getAvailableSlots = (date, serviceId) => 
  api.get('/api/appointments/available-slots', { params: { date, service_id: serviceId } });
export const createAppointment = (data) => api.post('/api/appointments', data);
export const updateAppointmentStatus = (id, status) => 
  api.put(`/api/appointments/${id}/status`, null, { params: { status } });

// Orders
export const getOrders = (status) => 
  api.get('/api/orders', { params: status ? { status } : {} });
export const createOrder = (data) => api.post('/api/orders', data);
export const updateOrderStatus = (id, status) => 
  api.put(`/api/orders/${id}/status`, null, { params: { status } });

// Dashboard & Admin Settings
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const getPopularServices = (limit = 5) => 
  api.get('/api/dashboard/popular-services', { params: { limit } });
export const getRevenueChart = (days = 7) => 
  api.get('/api/dashboard/revenue-chart', { params: { days } });

// NOVAS ROTAS DE CONFIGURAÇÃO
export const getAdminSettings = () => api.get('/api/admin/settings');
export const updateAdminSettings = (data) => api.post('/api/admin/settings', data);

export const getCustomers = () => api.get('/api/admin/customers');
