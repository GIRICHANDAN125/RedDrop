import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — trigger logout via event
      // In a real app: use event emitter or Zustand
      console.warn('Authentication expired');
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me')
};

export const donorAPI = {
  getNearby: (params) => api.get('/donors/nearby', { params }),
  search: (params) => api.get('/donors/search', { params }),
  getProfile: () => api.get('/donors/profile'),
  updateProfile: (data) => api.put('/donors/profile', data),
  toggleAvailability: (data) => api.put('/donors/availability', data),
  getById: (id) => api.get(`/donors/${id}`)
};

export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  respond: (id, action) => api.post(`/requests/${id}/respond`, { action }),
  updateStatus: (id, data) => api.patch(`/requests/${id}/status`, data),
  uploadReport: (id, formData) => api.post(`/requests/${id}/upload-report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (ids) => api.patch('/notifications/read', { ids }),
  markAllRead: () => api.patch('/notifications/read-all')
};

export const trackingAPI = {
  getTracking: (requestId) => api.get(`/tracking/${requestId}`)
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/users/stats'),
  updateFCMToken: (token) => api.patch('/users/fcm-token', { token })
};
