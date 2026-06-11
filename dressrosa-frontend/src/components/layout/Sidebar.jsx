import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  ShoppingBag,
  Heart, 
  Package, 
  MessageCircle,
  Moon,
  MoreHorizontal
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { messageService } from '../../services/messageService';
import { getImageUrl } from '../../utils/helpers';

const Sidebar = () => {
  const { user } = useAuthStore();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      const msgCount = await messageService.getUnreadCount();
      setUnreadMessageCount(msgCount || 0);
    } catch (error) {
      console.error('Error fetching sidebar counts:', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: ROUTES.HOME },
    { icon: Users, label: 'Following', path: ROUTES.FOLLOWING },
    { icon: ShoppingBag, label: 'Shop', path: ROUTES.SHOP },
    { icon: Heart, label: 'Wishlist', path: ROUTES.WISHLIST },
    { icon: Package, label: 'Orders', path: ROUTES.ORDERS },
    { icon: MessageCircle, label: 'Messages', path: ROUTES.MESSAGES, badge: unreadMessageCount },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 transition-all duration-300 overflow-hidden shadow-sm">
      {/* Brand Logo Area */}
      <div className="p-8 pb-10">
        <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-burgundy rounded-2xl flex items-center justify-center shadow-lg shadow-burgundy/20 group-hover:rotate-6 transition-transform overflow-hidden">
            <img src={getImageUrl('/uploads/photos/Dressrosalogo.png')} alt="Dressrosa" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-serif font-bold text-gray-900 tracking-tight italic">Dressrosa</span>
        </Link>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar-none">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? 'bg-burgundy/5 text-burgundy'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center space-x-4">
                  <item.icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-burgundy fill-burgundy/5' : 'text-gray-400 group-hover:text-burgundy'
                  }`} />
                  <span className={`text-[15px] ${isActive ? 'font-black' : 'font-bold'} tracking-tight`}>
                    {item.label}
                  </span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-burgundy text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;