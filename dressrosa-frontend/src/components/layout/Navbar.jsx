import { useState, useEffect } from 'react';
import { Search, ShoppingCart, MessageCircle, Bell, User, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import CartDropdown from './dropdowns/CartDropdown';
import MessagesDropdown from './dropdowns/MessagesDropdown';
import NotificationsDropdown from './dropdowns/NotificationsDropdown';
import ProfileDropdown from './dropdowns/ProfileDropdown';
import { useCartStore } from '../../store/cartStore';
import { messageService } from '../../services/messageService';
import { notificationService } from '../../services/notificationService';

const Navbar = () => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotificationCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotificationCount();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadMessageCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount('BUYER');
      setUnreadNotificationCount(count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-20 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent focus:bg-white transition-all"
          />
        </div>
      </form>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-2 ml-6">
        {/* Cart Dropdown */}
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown('cart')}
            className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy text-white text-xs rounded-full flex items-center justify-center font-medium">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          {openDropdown === 'cart' && <CartDropdown onClose={() => setOpenDropdown(null)} />}
        </div>

        {/* Messages Dropdown */}
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown('messages')}
            className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-700" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>
          {openDropdown === 'messages' && <MessagesDropdown onClose={() => setOpenDropdown(null)} />}
        </div>

        {/* Notifications Dropdown */}
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown('notifications')}
            className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
          {openDropdown === 'notifications' && <NotificationsDropdown onClose={() => setOpenDropdown(null)} />}
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown('profile')}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-burgundy to-burgundy-light rounded-full flex items-center justify-center">
              {user?.userName ? (
                <span className="text-white font-semibold text-sm">
                  {user.userName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
          {openDropdown === 'profile' && <ProfileDropdown onClose={() => setOpenDropdown(null)} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;