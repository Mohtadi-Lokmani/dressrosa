import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const categoryService = {
  /**
   * Get all categories
   */
  getAll: async () => {
    const response = await api.get(ENDPOINTS.CATEGORIES.ALL);
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (categoryId) => {
    const response = await api.get(ENDPOINTS.CATEGORIES.BY_ID(categoryId));
    return response.data;
  },
};

export default categoryService;