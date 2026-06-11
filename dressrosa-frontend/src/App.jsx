import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import { ROLES } from './utils/constants';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public Pages
import HomePage from './pages/public/HomePage';
import FollowingPage from './pages/public/FollowingPage';
import ShopPage from './pages/public/ShopPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderConfirmationPage from './pages/orders/OrderConfirmationPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import MessagesPage from './pages/messages/MessagesPage';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import WishlistPage from './pages/profile/WishlistPage';
import FollowPage from './pages/profile/FollowPage';
import SettingsPage from './pages/profile/SettingsPage';
import SellerProfilePage from './pages/public/SellerProfilePage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import MyProductsPage from './pages/seller/MyProductsPage';

// Studio (Seller Business Suite)
import StudioLayout from './components/studio/StudioLayout';
import StudioHomePage from './pages/studio/StudioHomePage';
import StudioComingSoon from './pages/studio/StudioComingSoon';
import StudioProductsPage from './pages/studio/StudioProductsPage';
import StudioAddProductPage from './pages/studio/StudioAddProductPage';
import StudioEditProductPage from './pages/studio/StudioEditProductPage';
import StudioCollectionsPage from './pages/studio/StudioCollectionsPage';
import StudioOrdersPage from './pages/studio/StudioOrdersPage';
import StudioAnalyticsPage from './pages/studio/StudioAnalyticsPage';
import StudioMessagesPage from './pages/studio/StudioMessagesPage';
import StudioNotificationsPage from './pages/studio/StudioNotificationsPage';
import StudioBoostPage from './pages/studio/StudioBoostPage';
import StudioProfileEditorPage from './pages/studio/StudioProfileEditorPage';
import StudioSettingsPage from './pages/studio/StudioSettingsPage';

// Admin Pages & Layout
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

// Temporary placeholder
const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-burgundy mb-4">{title}</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#800020',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Default Route - Redirect based on auth */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === ROLES.ADMIN ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Auth Routes (No Layout) */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              user?.role === ROLES.ADMIN ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              user?.role === ROLES.ADMIN ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <RegisterPage />
            )
          } 
        />

        {/* Protected Routes with Layout - ALL REQUIRE LOGIN */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Main Feed */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/following" element={<FollowingPage />} />
          
          {/* Shop & Products */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          
          {/* Public Profiles */}
          <Route path="/seller/:id" element={<SellerProfilePage />} />
          
          {/* Buyer Routes */}
          {/* Checkout & Orders */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
<Route path="/profile/:id" element={<ProfilePage />} />
<Route path="/profile/edit" element={<EditProfilePage />} />
<Route path="/wishlist" element={<WishlistPage />} />
<Route path="/follow" element={<FollowPage />} />
<Route path="/settings" element={<SettingsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          
          {/* Seller Routes */}
<Route 
  path="/seller/dashboard" 
  element={
    <RoleGuard allowedRoles={[ROLES.SELLER]}>
      <SellerDashboardPage />
    </RoleGuard>
  } 
/>
<Route 
  path="/seller/products" 
  element={
    <RoleGuard allowedRoles={[ROLES.SELLER]}>
      <MyProductsPage />
    </RoleGuard>
  } 
/>
<Route 
  path="/seller/products/add" 
  element={
    <RoleGuard allowedRoles={[ROLES.SELLER]}>
      <AddProductPage />
    </RoleGuard>
  } 
/>
<Route 
  path="/seller/products/edit/:id" 
  element={
    <RoleGuard allowedRoles={[ROLES.SELLER]}>
      <EditProductPage />
    </RoleGuard>
  } 
/>

          {/* Error Pages */}
          <Route path="/unauthorized" element={<ComingSoon title="403 - Unauthorized" />} />
          <Route path="*" element={<ComingSoon title="404 - Not Found" />} />
        </Route>

        {/* Studio Routes — Seller Business Suite (completely separate from MainLayout) */}
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[ROLES.SELLER]}>
                <StudioLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<StudioHomePage />} />
          <Route path="products" element={<StudioProductsPage />} />
          <Route path="collections" element={<StudioCollectionsPage />} />
          <Route path="products/add" element={<StudioAddProductPage />} />
          <Route path="products/:id/edit" element={<StudioEditProductPage />} />
          <Route path="orders" element={<StudioOrdersPage />} />
          <Route path="analytics" element={<StudioAnalyticsPage />} />
          <Route path="messages" element={<StudioMessagesPage />} />
          <Route path="notifications" element={<StudioNotificationsPage />} />
          <Route path="boost" element={<StudioBoostPage />} />
          <Route path="profile/edit" element={<StudioProfileEditorPage />} />
          <Route path="settings" element={<StudioSettingsPage />} />
        </Route>

        {/* Admin Routes — Platform Dashboard (completely separate layout, ADMIN only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;