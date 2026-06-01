import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  ShoppingBag,
  Heart, 
  Package, 
  MessageCircle,
  Moon,
  MoreHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { messageService } from '../../services/messageService';

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
          <div className="w-10 h-10 bg-burgundy rounded-2xl flex items-center justify-center shadow-lg shadow-burgundy/20 group-hover:rotate-6 transition-transform">
            <span className="text-white font-black text-xl leading-none">D</span>
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

      {/* Bottom Actions & Decor */}
      <div className="relative p-4 mt-auto">
        

        {/* Action Buttons */}
        <div className="relative z-10 space-y-1 mb-6 px-2">
          {/* Dark Mode */}
          <button className="w-full flex items-center space-x-4 px-5 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group">
            <Moon className="w-5 h-5 text-gray-400 group-hover:text-burgundy transition-colors" />
            <span className="font-bold text-[15px] tracking-tight">Dark Mode</span>
          </button>

          {/* More Menu */}
          <button className="w-full flex items-center space-x-4 px-5 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group">
            <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-burgundy transition-colors" />
            <span className="font-bold text-[15px] tracking-tight">More</span>
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="relative z-10 p-2 pt-0">
          <div className="w-full h-[1px] bg-gray-50 mb-4 opacity-50"></div>
          <div className="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group border border-transparent hover:border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-burgundy/10 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-1 ring-burgundy/5">
                <span className="text-burgundy font-black text-base">
                  {user?.userName?.charAt(0).toUpperCase() || 'D'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-gray-900 tracking-tight leading-none mb-1 group-hover:text-burgundy transition-colors">
                  {user?.userName || 'Dressrosa'}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Details</span>
              </div>
            </div>
            <div className="flex flex-col -space-y-1">
              <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-burgundy transition-colors" />
              <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-burgundy transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;