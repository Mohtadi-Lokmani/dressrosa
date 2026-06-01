import { create } from 'zustand';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

export const useAuthStore = create((set, get) => ({
  // State
  user: storage.auth.getUser(),
  token: storage.auth.getToken(),
  isAuthenticated: !!storage.auth.getToken(),
  loading: false,
  error: null,

  // Actions
  
  /**
   * Set user and token
   */
  setAuth: (user, token) => {
    storage.auth.setUser(user);
    storage.auth.setToken(token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  /**
   * Login
   */
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, password);
      get().setAuth(data, data.token);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Login failed' 
      });
      throw error;
    }
  },

  /**
   * Google Login
   */
  googleLogin: async (idToken, details) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.googleLogin(idToken, details);
      get().setAuth(data, data.token);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Google login failed' 
      });
      throw error;
    }
  },

  /**
   * Check Google user
   */
  googleCheck: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const exists = await authService.googleCheck(idToken);
      set({ loading: false });
      return exists;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Register
   */
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      get().setAuth(data, data.token);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Registration failed' 
      });
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: () => {
    storage.auth.clearAuth();
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  /**
   * Update user data
   */
  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    storage.auth.setUser(updatedUser);
    set({ user: updatedUser });
  },

  /**
   * Check authentication status
   */
  checkAuth: () => {
    const token = storage.auth.getToken();
    const user = storage.auth.getUser();
    
    if (token && user) {
      set({ user, token, isAuthenticated: true });
      return true;
    }
    
    set({ user: null, token: null, isAuthenticated: false });
    return false;
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;