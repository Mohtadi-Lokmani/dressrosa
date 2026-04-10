import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { storage } from '../utils/storage';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = storage.auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      storage.auth.clearAuth();
      
      // Don't redirect on login/register endpoints
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      if (!isAuthEndpoint) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else {
      // Show error toast for other errors
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;