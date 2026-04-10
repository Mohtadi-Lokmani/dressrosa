import { Home, Users, ShoppingBag, MessageCircle, Bookmark, Package, Moon, MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: ROUTES.HOME },
    { icon: Users, label: 'Following', path: ROUTES.FOLLOWING },
    { icon: ShoppingBag, label: 'Shop', path: ROUTES.SHOP },
    { icon: Bookmark, label: 'Wishlist', path: ROUTES.WISHLIST },
    { icon: Package, label: 'Orders', path: ROUTES.ORDERS },
    { icon: MessageCircle, label: 'Messages', path: ROUTES.MESSAGES },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-8 z-50">
      {/* Logo */}
      <NavLink to={ROUTES.HOME} className="w-12 h-12 bg-burgundy rounded-full flex items-center justify-center hover:bg-burgundy-dark transition-colors">
        <span className="text-white font-bold text-xl">D</span>
      </NavLink>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-burgundy text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            
            {/* Tooltip */}
            <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col space-y-4">
        {/* Dark Mode Toggle (Optional - for future) */}
        <button className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 group relative">
          <Moon className="w-6 h-6" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Dark Mode
          </span>
        </button>

        {/* More Options */}
        <button className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 group relative">
          <MoreHorizontal className="w-6 h-6" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            More
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;