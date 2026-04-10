import { User, Package, Heart, Settings, LogOut, Store, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { ROLES } from '../../../utils/constants';

const ProfileDropdown = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const isSeller = user?.role === ROLES.SELLER;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
      {/* User Info */}
      <div className="px-4 py-4 bg-gradient-to-r from-burgundy to-burgundy-light">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-burgundy font-bold text-lg">
              {user?.userName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">
              {user?.userName || 'User'}
            </h3>
            <p className="text-sm text-white/80 truncate">
              {user?.email || 'user@email.com'}
            </p>
          </div>
        </div>
        <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-full">
          <span className="text-xs font-medium text-white">
            {isSeller ? '🏪 Seller' : '🛍️ Buyer'}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {/* Common Items */}
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">My Profile</span>
        </Link>

        <Link
          to="/orders"
          onClick={onClose}
          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <Package className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {isSeller ? 'My Sales' : 'My Orders'}
          </span>
        </Link>

        {!isSeller && (
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Wishlist</span>
          </Link>
        )}

        {/* Seller-specific Items */}
        {isSeller && (
          <>
            <div className="my-2 border-t border-gray-200"></div>
            
            <Link
              to="/seller/dashboard"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Dashboard</span>
            </Link>

            <Link
              to="/seller/products"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <Store className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">My Products</span>
            </Link>
          </>
        )}

        <div className="my-2 border-t border-gray-200"></div>

        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-600">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;