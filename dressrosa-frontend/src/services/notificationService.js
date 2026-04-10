import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const notificationService = {
  /**
   * Get all notifications
   */
  getAll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS.ALL, { params });
    return response.data;
  },

  /**
   * Get unread notifications
   */
  getUnread: async (params = {}) => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS.UNREAD, { params });
    return response.data;
  },

  /**
   * Get recent notifications (last 10)
   */
  getRecent: async () => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS.RECENT);
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
  },

  /**
   * Get notifications by type
   */
  getByType: async (type) => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS.BY_TYPE(type));
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    const response = await api.put(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.put(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
    return response.data;
  },

  /**
   * Delete all notifications
   */
  deleteAll: async () => {
    const response = await api.delete(ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
    return response.data;
  },
};

export default notificationService;