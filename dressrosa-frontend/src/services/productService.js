import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const productService = {
  /**
   * Get all products with filters and pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PRODUCTS.ALL, { params });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getById: async (productId) => {
    const response = await api.get(ENDPOINTS.PRODUCTS.BY_ID(productId));
    return response.data;
  },

  /**
   * Create new product (seller only)
   */
  create: async (productData) => {
    const response = await api.post(ENDPOINTS.PRODUCTS.CREATE, productData);
    return response.data;
  },

  /**
   * Update product (seller only)
   */
  update: async (productId, productData) => {
    const response = await api.put(ENDPOINTS.PRODUCTS.UPDATE(productId), productData);
    return response.data;
  },

  /**
   * Delete product (seller only)
   */
  delete: async (productId) => {
    const response = await api.delete(ENDPOINTS.PRODUCTS.DELETE(productId));
    return response.data;
  },

  /**
   * Get products by seller
   */
  getBySeller: async (sellerId, params = {}) => {
    const response = await api.get(ENDPOINTS.PRODUCTS.BY_SELLER(sellerId), { params });
    return response.data;
  },

  /**
   * Get my products (current seller)
   */
  getMyProducts: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PRODUCTS.MY_PRODUCTS, { params });
    return response.data;
  },

  /**
   * Search products
   */
  search: async (filters) => {
    const params = {
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search: filters.search,
      status: filters.status,
      page: filters.page || 0,
      size: filters.size || 20,
      sort: filters.sort || 'createdAt,desc',
    };
    
    const response = await api.get(ENDPOINTS.PRODUCTS.ALL, { params });
    return response.data;
  },

  /**
   * Get products from followed sellers
   */
  getFollowingProducts: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PRODUCTS.FOLLOWING, { params });
    return response.data;
  },
};

export default productService;