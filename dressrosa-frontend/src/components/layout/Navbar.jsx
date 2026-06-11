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
import { getImageUrl } from '../../utils/helpers';
import Avatar from '../common/Avatar';

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
    <nav className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100/50 z-40 flex items-center px-8">
      {/* Search Bar - Wider and closer to sidebar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-burgundy transition-colors" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-full focus:outline-none focus:ring-2 focus:ring-burgundy/5 focus:border-burgundy/10 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
      </form>

      {/* Right Side Icons - Tighter spacing */}
      <div className="flex items-center space-x-1.5 ml-auto">
        {/* Cart */}
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown('cart')}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-all group"
          >
            <ShoppingCart className="w-[22px] h-[22px] text-gray-600 group-hover:text-burgundy transition-colors" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-burgundy text-white text-[9px] rounded-full flex items-center justify-center font-black">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          {openDropdown === 'cart' && <CartDropdown onClose={() => setOpenDropdown(null)} />}
        </div>

        {/* Messages */}
        <div className="relative">
          <button className="p-2 rounded-xl hover:bg-gray-50 transition-all group">
            <MessageCircle className="w-[22px] h-[22px] text-gray-600 group-hover:text-burgundy transition-colors" />
          </button>
        </div>

        {/* Notifications */}
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown('notifications')}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-all group"
          >
            <Bell className="w-[22px] h-[22px] text-gray-600 group-hover:text-burgundy transition-colors" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-burgundy rounded-full border-2 border-white"></span>
            )}
          </button>
          {openDropdown === 'notifications' && <NotificationsDropdown onClose={() => setOpenDropdown(null)} />}
        </div>

        {/* User Profile */}
        <div className="dropdown-container relative ml-1">
          <button
            onClick={() => toggleDropdown('profile')}
            className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-center">
              <Avatar
                src={user?.profilePhoto || user?.profileImage || undefined}
                name={user?.userName}
                size="sm"
              />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {openDropdown === 'profile' && <ProfileDropdown onClose={() => setOpenDropdown(null)} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;