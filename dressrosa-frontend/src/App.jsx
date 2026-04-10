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

import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import MyProductsPage from './pages/seller/MyProductsPage';
import MySalesPage from './pages/seller/MySalesPage';

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
  const { isAuthenticated } = useAuthStore();

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
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Auth Routes (No Layout) */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />} 
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
          <Route path="/seller/:id" element={<ComingSoon title="Seller Profile" />} />
          
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
<Route 
  path="/seller/sales" 
  element={
    <RoleGuard allowedRoles={[ROLES.SELLER]}>
      <MySalesPage />
    </RoleGuard>
  } 
/>
         

          {/* Error Pages */}
          <Route path="/unauthorized" element={<ComingSoon title="403 - Unauthorized" />} />
          <Route path="*" element={<ComingSoon title="404 - Not Found" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;