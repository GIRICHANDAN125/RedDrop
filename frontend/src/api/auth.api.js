// Auth API service for RedDrop AI V2
import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  verifyOtp: (data) => client.post('/auth/verify-otp', data),
  refreshToken: (data) => client.post('/auth/refresh', data),
  logout: () => client.post('/auth/logout')
};

export default authApi;
