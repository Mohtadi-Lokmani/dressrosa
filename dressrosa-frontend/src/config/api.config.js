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
    GOOGLE_LOGIN: '/api/auth/google-login',
    GOOGLE_CHECK: '/api/auth/google-check',
  },
  
  // Users
  USERS: {
    ME: '/api/users/me',
    BY_ID: (id) => `/api/users/${id}`,
    UPDATE: '/api/users/me',
    CHANGE_PASSWORD: '/api/users/me/password',
    UPLOAD_PHOTO: '/api/users/me/photo',
    UPLOAD_BANNER: '/api/users/me/banner',
    SELLER: (id) => `/api/users/seller/${id}`,
    SELLER_DASHBOARD: '/api/users/seller/dashboard',
    BUYER_DASHBOARD: '/api/users/buyer/dashboard',
    SELLERS_LIST: '/api/users/sellers',
  },
  
  // Products
  PRODUCTS: {
    ALL: '/api/products',
    FEED: '/api/products/feed',
    BY_ID: (id) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id) => `/api/products/${id}`,
    DELETE: (id) => `/api/products/${id}`,
    BY_SELLER: (id) => `/api/products/seller/${id}`,
    MY_PRODUCTS: '/api/products/my-products',
    FOLLOWING: '/api/products/following',
    BOOST: (id) => `/api/products/${id}/boost`,
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
    SELLER_REVIEWS: (sellerId) => `/api/social/reviews/seller/${sellerId}`,
    MY_REVIEWS: '/api/social/reviews/my-reviews',
    DELETE_REVIEW: (id) => `/api/social/reviews/${id}`,
  },

  // Collections
  COLLECTIONS: {
    BY_SELLER: (sellerId) => `/api/collections/seller/${sellerId}`,
    CREATE: '/api/collections',
    ITEMS: (collectionId) => `/api/collections/${collectionId}/items`,
    PRODUCTS: (collectionId) => `/api/collections/${collectionId}/products`,
    ADD_ITEM: (collectionId) => `/api/collections/${collectionId}/items`,
    REMOVE_ITEM: (collectionId, productId) => `/api/collections/${collectionId}/items/${productId}`,
    DELETE: (collectionId) => `/api/collections/${collectionId}`,
  },
  
  // Messages
  MESSAGES: {
    SEND: '/api/messages',
    CONVERSATION: (userId) => `/api/messages/conversation/${userId}`,
    CONVERSATIONS: '/api/messages/conversations',
    CONVERSATIONS_STUDIO: '/api/messages/conversations/studio',
    CONVERSATIONS_PROFILE: '/api/messages/conversations/profile',
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
    AUDIENCE_ALL: (audience) => `/api/notifications?audience=${audience}`,
    AUDIENCE_UNREAD: (audience) => `/api/notifications/unread?audience=${audience}`,
    AUDIENCE_COUNT: (audience) => `/api/notifications/unread/count?audience=${audience}`,
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

  // Studio
  STUDIO: {
    ANALYTICS: '/api/studio/analytics',
    HOME_TODO: '/api/users/studio/todo',
    NOTIFICATIONS: '/api/notifications?audience=SELLER',
    MESSAGES: '/api/messages/conversations/studio',
    BOOST: '/api/studio/boost',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    TOGGLE_VERIFY: (userId) => `/api/admin/users/${userId}/verify`,
    CHANGE_ROLE: (userId) => `/api/admin/users/${userId}/role`,
    DELETE_USER: (userId) => `/api/admin/users/${userId}`,
    PRODUCTS: '/api/admin/products',
    DELETE_PRODUCT: (productId) => `/api/admin/products/${productId}`,
    TOGGLE_BOOST: (productId) => `/api/admin/products/${productId}/boost`,
    ORDERS: '/api/admin/orders',
    UPDATE_ORDER_STATUS: (orderId) => `/api/admin/orders/${orderId}/status`,
    CATEGORIES: '/api/admin/categories',
    UPDATE_CATEGORY: (id) => `/api/admin/categories/${id}`,
    DELETE_CATEGORY: (id) => `/api/admin/categories/${id}`,
    REVIEWS: '/api/admin/reviews',
    DELETE_REVIEW: (reviewId) => `/api/admin/reviews/${reviewId}`,
    SEND_NOTIFICATION: '/api/admin/notifications/send',
  },
};