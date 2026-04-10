import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const cartService = {
  /**
   * Get current user's cart
   */
  getCart: async () => {
    const response = await api.get(ENDPOINTS.CART.GET);
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId, variantId, quantity) => {
    const response = await api.post(ENDPOINTS.CART.ADD, {
      productId,
      variantId,
      quantity,
    });
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateQuantity: async (cartId, quantity) => {
    const response = await api.put(`${ENDPOINTS.CART.UPDATE(cartId)}?quantity=${quantity}`);
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId) => {
    const response = await api.delete(ENDPOINTS.CART.DELETE(cartId));
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    const response = await api.delete(ENDPOINTS.CART.CLEAR);
    return response.data;
  },
};

export default cartService;