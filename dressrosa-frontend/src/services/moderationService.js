/**
 * Moderation Service - Frontend
 * 
 * Handles communication with the backend moderation API.
 * Provides methods to check product content for toxicity before submission.
 * 
 * Usage:
 * const result = await moderationService.checkProduct(title, description);
 * if (result.status === 'VALID') {
 *   // Safe to submit product
 * } else {
 *   // Show error message to user
 * }
 */

import api from './api';

const MODERATION_API = '/moderation';

export const moderationService = {
  /**
   * Check product content for toxicity
   * 
   * @param {string} title - Product title
   * @param {string} description - Product description
   * @returns {Promise<Object>} Moderation response
   * 
   * Response format:
   * {
   *   status: 'VALID' | 'INVALID',
   *   reason: 'User-friendly message',
   *   toxicityScore: 0.15,
   *   flaggedField: 'title' | 'description' | null
   * }
   */
  checkProduct: async (title, description) => {
    try {
      const response = await api.post(`${MODERATION_API}/check`, {
        title,
        description
      });
      
      return response.data;
    } catch (error) {
      // Handle errors from API
      if (error.response?.status === 400) {
        // Invalid content (expected error)
        return error.response.data;
      } else {
        // Unexpected error
        console.error('Moderation check failed:', error);
        throw new Error('Failed to check content for moderation');
      }
    }
  },

  /**
   * Check only product title
   * 
   * @param {string} title - Product title
   * @returns {Promise<Object>} Moderation response
   */
  checkTitle: async (title) => {
    try {
      const response = await api.post(`${MODERATION_API}/check`, {
        title,
        description: '' // Empty description for title-only check
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw new Error('Failed to check title for moderation');
    }
  },

  /**
   * Check only product description
   * 
   * @param {string} description - Product description
   * @returns {Promise<Object>} Moderation response
   */
  checkDescription: async (description) => {
    try {
      const response = await api.post(`${MODERATION_API}/check`, {
        title: '', // Empty title for description-only check
        description
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw new Error('Failed to check description for moderation');
    }
  }
};

export default moderationService;
