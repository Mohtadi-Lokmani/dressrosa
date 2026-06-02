import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  toggleVerification: async (userId) => {
    const response = await api.put(ENDPOINTS.ADMIN.TOGGLE_VERIFY(userId));
    return response.data;
  },

  changeUserRole: async (userId, role) => {
    const response = await api.put(ENDPOINTS.ADMIN.CHANGE_ROLE(userId), null, { params: { role } });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(ENDPOINTS.ADMIN.DELETE_USER(userId));
    return response.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ADMIN.PRODUCTS, { params });
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(ENDPOINTS.ADMIN.DELETE_PRODUCT(productId));
    return response.data;
  },

  toggleProductBoost: async (productId) => {
    const response = await api.put(ENDPOINTS.ADMIN.TOGGLE_BOOST(productId));
    return response.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ADMIN.ORDERS, { params });
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(orderId), null, { params: { status } });
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get(ENDPOINTS.ADMIN.CATEGORIES);
    return response.data;
  },

  createCategory: async (name) => {
    const response = await api.post(ENDPOINTS.ADMIN.CATEGORIES, { name });
    return response.data;
  },

  updateCategory: async (id, name) => {
    const response = await api.put(ENDPOINTS.ADMIN.UPDATE_CATEGORY(id), { name });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(ENDPOINTS.ADMIN.DELETE_CATEGORY(id));
    return response.data;
  },

  // Reviews
  getReviews: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ADMIN.REVIEWS, { params });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(ENDPOINTS.ADMIN.DELETE_REVIEW(reviewId));
    return response.data;
  },

  // Notifications
  sendNotification: async (data) => {
    const response = await api.post(ENDPOINTS.ADMIN.SEND_NOTIFICATION, data);
    return response.data;
  },
};
