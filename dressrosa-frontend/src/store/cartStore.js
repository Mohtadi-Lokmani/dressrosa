import { create } from 'zustand';
import { cartService } from '../services/cartService';

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  itemCount: 0,

  // Fetch cart
  fetchCart: async () => {
    try {
      set({ loading: true });
      const data = await cartService.getCart();
      set({
        cart: data,
        itemCount: data.items?.length || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      set({ loading: false });
    }
  },

  // Add item to cart
  addItem: async (productId, variantId, quantity) => {
    try {
      await cartService.addToCart(productId, variantId, quantity);
      await get().fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update item quantity
  updateQuantity: async (cartItemId, quantity) => {
    try {
      await cartService.updateQuantity(cartItemId, quantity);
      await get().fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  },

  // Remove item
  removeItem: async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      await get().fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      await cartService.clearCart();
      set({ cart: null, itemCount: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Calculate total
  getTotal: () => {
    const { cart } = get();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  },
}));