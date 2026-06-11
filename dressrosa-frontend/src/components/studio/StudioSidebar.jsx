import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Package, ShoppingBag, BarChart3, MessageCircle,
  Bell, Zap, Settings, ArrowLeft, ChevronRight
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';
import { messageService } from '../../services/messageService';
import { notificationService } from '../../services/notificationService';

const navItems = [
  {
    section: null,
    items: [
      { icon: Home, label: 'Home', path: ROUTES.STUDIO_HOME, exact: true },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { icon: Package, label: 'Products', path: ROUTES.STUDIO_PRODUCTS },
      { icon: Package, label: 'Collections', path: ROUTES.STUDIO_COLLECTIONS },
      { icon: ShoppingBag, label: 'Orders', path: ROUTES.STUDIO_ORDERS },
    ],
  },
  {
    section: 'GROW',
    items: [
      { icon: BarChart3, label: 'Analytics', path: ROUTES.STUDIO_ANALYTICS },
      { icon: Zap, label: 'Boost & Ads', path: ROUTES.STUDIO_BOOST },
    ],
  },
  {
    section: 'CONNECT',
    items: [
      { icon: MessageCircle, label: 'Messages', path: ROUTES.STUDIO_MESSAGES },
      { icon: Bell, label: 'Notifications', path: ROUTES.STUDIO_NOTIFICATIONS },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      { icon: Settings, label: 'Settings', path: ROUTES.STUDIO_SETTINGS },
    ],
  },
];

const StudioSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      const [msgCount, notifCount] = await Promise.all([
        messageService.getUnreadCount(), // TODO: Filter by merchant if count service allows
        notificationService.getUnreadCount('SELLER')
      ]);
      setUnreadMessages(msgCount || 0);
      setUnreadNotifications(notifCount || 0);
    } catch (error) {
      console.error('Error fetching studio sidebar counts:', error);
    }
  };

  const getUnreadCountForItem = (label) => {
    if (label === 'Messages') return unreadMessages;
    if (label === 'Notifications') return unreadNotifications;
    return 0;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col z-50 shadow-md">
      {/* Studio Brand Header */}
      <div className="flex items-center space-x-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-gradient-to-br from-burgundy to-burgundy-dark rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-black text-base leading-none">S</span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-0.5">
            Dressrosa
          </p>
          <h1 className="text-base font-black text-gray-900 leading-none">Studio</h1>
        </div>
      </div>

      {/* Seller Identity */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-burgundy/20 to-burgundy/10 rounded-full flex items-center justify-center ring-2 ring-burgundy/10">
            <span className="text-burgundy font-black text-sm">
              {user?.userName?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.userName || 'Seller'}</p>
            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-widest">● Active Atelier</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {group.section && (
              <p className="px-4 mb-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-burgundy text-white shadow-md shadow-burgundy/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3.5">
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      {getUnreadCountForItem(item.label) > 0 && !isActive && (
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center">
                          {getUnreadCountForItem(item.label) > 9 ? '9+' : getUnreadCountForItem(item.label)}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — Exit Studio */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => navigate('/home')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
          <span>Exit Studio</span>
        </button>
        <p className="text-center text-[10px] text-gray-300 font-medium mt-2">
          Dressrosa Studio v1.0
        </p>
      </div>
    </aside>
  );
};

export default StudioSidebar;
