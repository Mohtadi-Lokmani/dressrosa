import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const orderService = {
  /**
   * Place new order
   */
  placeOrder: async (orderData) => {
    const response = await api.post(ENDPOINTS.ORDERS.PLACE, orderData);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getById: async (orderId) => {
    const response = await api.get(ENDPOINTS.ORDERS.BY_ID(orderId));
    return response.data;
  },

  /**
   * Get my orders (buyer)
   */
  getMyOrders: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ORDERS.MY_ORDERS, { params });
    return response.data;
  },

  /**
   * Get my sales (seller)
   */
  getMySales: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ORDERS.MY_SALES, { params });
    return response.data;
  },

  /**
   * Update order status (seller)
   */
  updateStatus: async (orderId, status) => {
    const response = await api.put(`${ENDPOINTS.ORDERS.UPDATE_STATUS(orderId)}?status=${status}`);
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId) => {
    const response = await api.post(ENDPOINTS.ORDERS.CANCEL(orderId));
    return response.data;
  },
};

export default orderService;