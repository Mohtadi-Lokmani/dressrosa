/**
 * LocalStorage helper functions with error handling
 */

const STORAGE_KEYS = {
  TOKEN: 'dressrosa_token',
  USER: 'dressrosa_user',
  CART: 'dressrosa_cart',
  THEME: 'dressrosa_theme',
};

export const storage = {
  /**
   * Get item from localStorage
   */
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Auth token helpers
   */
  auth: {
    getToken: () => storage.get(STORAGE_KEYS.TOKEN),
    setToken: (token) => storage.set(STORAGE_KEYS.TOKEN, token),
    removeToken: () => storage.remove(STORAGE_KEYS.TOKEN),
    
    getUser: () => storage.get(STORAGE_KEYS.USER),
    setUser: (user) => storage.set(STORAGE_KEYS.USER, user),
    removeUser: () => storage.remove(STORAGE_KEYS.USER),

    clearAuth: () => {
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.USER);
    },
  },

  /**
   * Cart helpers
   */
  cart: {
    get: () => storage.get(STORAGE_KEYS.CART) || [],
    set: (cart) => storage.set(STORAGE_KEYS.CART, cart),
    clear: () => storage.remove(STORAGE_KEYS.CART),
  },

  /**
   * Theme helpers
   */
  theme: {
    get: () => storage.get(STORAGE_KEYS.THEME) || 'light',
    set: (theme) => storage.set(STORAGE_KEYS.THEME, theme),
  },
};

export default storage;