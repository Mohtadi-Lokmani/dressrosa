import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const userService = {
  /**
   * Get current user profile
   */
  getMyProfile: async () => {
    const response = await api.get(ENDPOINTS.USERS.ME);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await api.get(ENDPOINTS.USERS.BY_ID(userId));
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (userData) => {
    const response = await api.put(ENDPOINTS.USERS.UPDATE, userData);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    const response = await api.put(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  /**
   * Upload profile photo
   */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(ENDPOINTS.USERS.UPLOAD_PHOTO, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get seller profile (public)
   */
  getSellerProfile: async (sellerId) => {
    const response = await api.get(ENDPOINTS.USERS.SELLER(sellerId));
    return response.data;
  },

  /**
   * Get seller dashboard stats
   */
  getSellerDashboard: async () => {
    const response = await api.get(ENDPOINTS.USERS.SELLER_DASHBOARD);
    return response.data;
  },

  /**
   * Get buyer dashboard stats
   */
  getBuyerDashboard: async () => {
    const response = await api.get(ENDPOINTS.USERS.BUYER_DASHBOARD);
    return response.data;
  },
};

export default userService;