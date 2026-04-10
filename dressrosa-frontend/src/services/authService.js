import api from './api';
import { ENDPOINTS } from '../config/api.config';
import { storage } from '../utils/storage';

export const authService = {
  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.data.token) {
        storage.auth.setToken(response.data.token);
        storage.auth.setUser(response.data);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      
      if (response.data.token) {
        storage.auth.setToken(response.data.token);
        storage.auth.setUser(response.data);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    storage.auth.clearAuth();
    window.location.href = '/login';
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: () => {
    return storage.auth.getUser();
  },

  /**
   * Get current token from storage
   */
  getToken: () => {
    return storage.auth.getToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!storage.auth.getToken();
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role) => {
    const user = storage.auth.getUser();
    return user?.role === role;
  },
};

export default authService;