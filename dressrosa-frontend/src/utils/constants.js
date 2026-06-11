export const ROLES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const PRODUCT_STATUS = {
  IN_STOCK: 'IN_STOCK',
  SOLD_OUT: 'SOLD_OUT',
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'MESSAGE',
  ORDER: 'ORDER',
  FOLLOW: 'FOLLOW',
  LIKE: 'LIKE',
  REVIEW: 'REVIEW',
};

export const ROUTES = {
  // Public
  HOME: '/',
  FOLLOWING: '/following',
  SHOP: '/shop',
  PRODUCT_DETAIL: '/products/:id',
  SELLER_PUBLIC: '/seller/:id',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Buyer
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  
  // Seller (legacy, kept for backward compat during migration)
  SELLER_DASHBOARD: '/seller/dashboard',
  ADD_PRODUCT: '/seller/products/add',
  EDIT_PRODUCT: '/seller/products/edit/:id',
  MY_PRODUCTS: '/seller/products',
  MANAGE_ORDER: '/seller/orders/:id',
  FOLLOWERS: '/seller/followers',

  // Studio (The new Seller Business Suite)
  STUDIO_HOME: '/studio',
  STUDIO_PRODUCTS: '/studio/products',
  STUDIO_COLLECTIONS: '/studio/collections',
  STUDIO_PRODUCTS_ADD: '/studio/products/add',
  STUDIO_PRODUCTS_EDIT: '/studio/products/:id/edit',
  STUDIO_ORDERS: '/studio/orders',
  STUDIO_ANALYTICS: '/studio/analytics',
  STUDIO_MESSAGES: '/studio/messages',
  STUDIO_NOTIFICATIONS: '/studio/notifications',
  STUDIO_REVIEWS: '/studio/reviews',
  STUDIO_BOOST: '/studio/boost',
  STUDIO_PROFILE_EDIT: '/studio/profile/edit',
  STUDIO_SETTINGS: '/studio/settings',

  // Admin Dashboard
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_NOTIFICATIONS: '/admin/notifications',

  // Error
  NOT_FOUND: '*',
  UNAUTHORIZED: '/unauthorized',
};

export const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'createdAt,asc', label: 'Oldest First' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'title,asc', label: 'Name: A to Z' },
  { value: 'title,desc', label: 'Name: Z to A' },
];

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
  SIZE_OPTIONS: [10, 20, 50, 100],
};

export const CATEGORY_TABS = [
  { id: null, name: 'All', slug: 'all' },
  { id: 1, name: 'Men', slug: 'men' },
  { id: 2, name: 'Women', slug: 'women' },
  { id: 3, name: 'Accessories', slug: 'accessories' },
  { id: 4, name: 'Shoes', slug: 'shoes' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XLL', 'XLLL', ...Array.from({ length: 101 }, (_, i) => i.toString())];

export const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Brown', hex: '#92400E' },
];