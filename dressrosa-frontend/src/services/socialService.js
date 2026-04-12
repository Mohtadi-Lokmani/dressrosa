import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const socialService = {
  // ========== LIKES ==========
  
  /**
   * Like a product
   */
  likeProduct: async (productId) => {
    const response = await api.post(ENDPOINTS.SOCIAL.LIKE(productId));
    return response.data;
  },

  /**
   * Unlike a product
   */
  unlikeProduct: async (productId) => {
    const response = await api.delete(ENDPOINTS.SOCIAL.UNLIKE(productId));
    return response.data;
  },

  /**
   * Check if product is liked
   */
  checkLike: async (productId) => {
    const response = await api.get(ENDPOINTS.SOCIAL.CHECK_LIKE(productId));
    return response.data;
  },

  /**
   * Get my liked products
   */
  getMyLikes: async (params = {}) => {
    const response = await api.get(ENDPOINTS.SOCIAL.MY_LIKES, { params });
    return response.data;
  },

  // ========== SAVES (Wishlist) ==========
  
  /**
   * Save product to wishlist
   */
  saveProduct: async (productId) => {
    const response = await api.post(ENDPOINTS.SOCIAL.SAVE(productId));
    return response.data;
  },

  /**
   * Remove product from wishlist
   */
  unsaveProduct: async (productId) => {
    const response = await api.delete(ENDPOINTS.SOCIAL.UNSAVE(productId));
    return response.data;
  },

  /**
   * Check if product is saved
   */
  checkSave: async (productId) => {
    const response = await api.get(ENDPOINTS.SOCIAL.CHECK_SAVE(productId));
    return response.data;
  },

  // ========== FOLLOW ==========
  
  /**
   * Follow a seller
   */
  followSeller: async (sellerId) => {
    const response = await api.post(ENDPOINTS.SOCIAL.FOLLOW(sellerId));
    return response.data;
  },

  /**
   * Unfollow a seller
   */
  unfollowSeller: async (sellerId) => {
    const response = await api.delete(ENDPOINTS.SOCIAL.UNFOLLOW(sellerId));
    return response.data;
  },

  /**
   * Check if following a seller
   */
  checkFollow: async (sellerId) => {
    const response = await api.get(ENDPOINTS.SOCIAL.CHECK_FOLLOW(sellerId));
    return response.data;
  },

  /**
   * Get seller's followers
   */
  getFollowers: async (sellerId) => {
    const response = await api.get(ENDPOINTS.SOCIAL.FOLLOWERS(sellerId));
    return response.data;
  },

  /**
   * Get my following list
   */
  getMyFollowing: async () => {
    const response = await api.get(ENDPOINTS.SOCIAL.FOLLOWING);
    return response.data;
  },

  // ========== REVIEWS ==========
  
  /**
   * Add review
   */
  addReview: async (productId, rate, comment) => {
    const response = await api.post(ENDPOINTS.SOCIAL.REVIEWS, {
      productId,
      rate,
      comment,
    });
    return response.data;
  },

  /**
   * Get product reviews
   */
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(ENDPOINTS.SOCIAL.PRODUCT_REVIEWS(productId), { params });
    return response.data;
  },

  /**
   * Get my reviews
   */
  getMyReviews: async () => {
    const response = await api.get(ENDPOINTS.SOCIAL.MY_REVIEWS);
    return response.data;
  },

  /**
   * Delete review
   */
  deleteReview: async (reviewId) => {
    const response = await api.delete(ENDPOINTS.SOCIAL.DELETE_REVIEW(reviewId));
    return response.data;
  },
};

export default socialService;