import { User, Package, Heart, Settings, LogOut, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { ROLES } from '../../../utils/constants';
import { getImageUrl } from '../../../utils/helpers';
import Avatar from '../../common/Avatar';

const ProfileDropdown = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isSeller = user?.role === ROLES.SELLER;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleEnterStudio = () => {
    onClose();
    navigate('/studio');
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
      {/* User Info */}
      <div className="px-4 py-4 bg-gradient-to-r from-burgundy to-burgundy-light">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center">
            <Avatar
              src={user?.profilePhoto || user?.profileImage || undefined}
              name={user?.userName}
              size="lg"
            />
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
      </div>

      {/* Enter Studio CTA — Sellers only */}
      {isSeller && (
        <div className="px-3 py-3 border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={handleEnterStudio}
            className="w-full flex items-center justify-center space-x-2.5 bg-gradient-to-r from-burgundy to-burgundy-light text-white font-bold text-sm py-3 px-4 rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-100 transition-all duration-200 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter Studio</span>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">Seller</span>
          </button>
        </div>
      )}

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
          <span className="text-sm font-medium text-gray-700">My Orders</span>
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