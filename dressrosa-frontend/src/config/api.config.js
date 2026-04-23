export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8585',
  TIMEOUT: 10000,
  POLLING_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL) || 3000,
};

export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  
  // Users
  USERS: {
    ME: '/api/users/me',
    BY_ID: (id) => `/api/users/${id}`,
    UPDATE: '/api/users/me',
    CHANGE_PASSWORD: '/api/users/me/password',
    UPLOAD_PHOTO: '/api/users/me/photo',
    SELLER: (id) => `/api/users/seller/${id}`,
    SELLER_DASHBOARD: '/api/users/seller/dashboard',
    BUYER_DASHBOARD: '/api/users/buyer/dashboard',
  },
  
  // Products
  PRODUCTS: {
    ALL: '/api/products',
    BY_ID: (id) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id) => `/api/products/${id}`,
    DELETE: (id) => `/api/products/${id}`,
    BY_SELLER: (id) => `/api/products/seller/${id}`,
    MY_PRODUCTS: '/api/products/my-products',
    FOLLOWING: '/api/products/following',
  },
  
  // Cart
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart',
    UPDATE: (id) => `/api/cart/${id}`,
    DELETE: (id) => `/api/cart/${id}`,
    CLEAR: '/api/cart',
  },
  
  // Orders
  ORDERS: {
    PLACE: '/api/orders',
    BY_ID: (id) => `/api/orders/${id}`,
    MY_ORDERS: '/api/orders/my-orders',
    MY_SALES: '/api/orders/my-sales',
    UPDATE_STATUS: (id) => `/api/orders/${id}/status`,
    CANCEL: (id) => `/api/orders/${id}/cancel`,
  },
  
  // Social
  SOCIAL: {
    LIKE: (productId) => `/api/social/like/${productId}`,
    UNLIKE: (productId) => `/api/social/like/${productId}`,
    CHECK_LIKE: (productId) => `/api/social/like/${productId}/check`,
    MY_LIKES: '/api/social/like/my-likes',
    
    SAVE: (productId) => `/api/social/save/${productId}`,
    UNSAVE: (productId) => `/api/social/save/${productId}`,
    CHECK_SAVE: (productId) => `/api/social/save/${productId}/check`,
    MY_SAVED: '/api/social/save/my-saved',
    
    FOLLOW: (sellerId) => `/api/social/follow/${sellerId}`,
    UNFOLLOW: (sellerId) => `/api/social/follow/${sellerId}`,
    CHECK_FOLLOW: (sellerId) => `/api/social/follow/${sellerId}/check`,
    FOLLOWERS: (sellerId) => `/api/social/follow/${sellerId}/followers`,
    FOLLOWING: '/api/social/follow/my-following',
    
    REVIEWS: '/api/social/reviews',
    PRODUCT_REVIEWS: (productId) => `/api/social/reviews/product/${productId}`,
    MY_REVIEWS: '/api/social/reviews/my-reviews',
    DELETE_REVIEW: (id) => `/api/social/reviews/${id}`,
  },
  
  // Messages
  MESSAGES: {
    SEND: '/api/messages',
    CONVERSATION: (userId) => `/api/messages/conversation/${userId}`,
    CONVERSATIONS: '/api/messages/conversations',
    MARK_READ: (id) => `/api/messages/${id}/read`,
    MARK_CONVERSATION_READ: (userId) => `/api/messages/conversation/${userId}/read`,
    UNREAD_COUNT: '/api/messages/unread/count',
    UNREAD: '/api/messages/unread',
    DELETE: (id) => `/api/messages/${id}`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    ALL: '/api/notifications',
    UNREAD: '/api/notifications/unread',
    RECENT: '/api/notifications/recent',
    UNREAD_COUNT: '/api/notifications/unread/count',
    BY_TYPE: (type) => `/api/notifications/type/${type}`,
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
    DELETE: (id) => `/api/notifications/${id}`,
    DELETE_ALL: '/api/notifications',
  },
  
  // Categories
  CATEGORIES: {
    ALL: '/api/categories',
    BY_ID: (id) => `/api/categories/${id}`,
  },
  
  // Files
  FILES: {
    UPLOAD: '/api/files/upload',
  },
};