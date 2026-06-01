import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const collectionService = {
  getBySeller: async (sellerId) => {
    const res = await api.get(ENDPOINTS.COLLECTIONS.BY_SELLER(sellerId));
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post(ENDPOINTS.COLLECTIONS.CREATE, payload);
    return res.data;
  },

  addItem: async (collectionId, productId) => {
    const res = await api.post(ENDPOINTS.COLLECTIONS.ADD_ITEM(collectionId), { productId });
    return res.data;
  },

  removeItem: async (collectionId, productId) => {
    const res = await api.delete(ENDPOINTS.COLLECTIONS.REMOVE_ITEM(collectionId, productId));
    return res.data;
  },

  delete: async (collectionId) => {
    const res = await api.delete(ENDPOINTS.COLLECTIONS.DELETE(collectionId));
    return res.data;
  },

  getItems: async (collectionId) => {
    const res = await api.get(ENDPOINTS.COLLECTIONS.ITEMS(collectionId));
    return res.data;
  },
};

export default collectionService;

