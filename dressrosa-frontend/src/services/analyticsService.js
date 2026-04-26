import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const analyticsService = {
  getOverview: async (days = 30) => {
    try {
      const response = await api.get(`${ENDPOINTS.STUDIO.ANALYTICS}/overview`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  },

  // Future analytics endpoint placeholders
  getProducts: async () => {},
  getSales: async () => {},
  getReach: async () => {},
};
