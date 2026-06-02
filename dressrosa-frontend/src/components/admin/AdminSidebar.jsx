import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag, Tag,
  Star, Bell, LogOut, Shield, ChevronRight
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  {
    section: null,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, exact: true },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { icon: Users, label: 'Users', path: ROUTES.ADMIN_USERS },
      { icon: Package, label: 'Products', path: ROUTES.ADMIN_PRODUCTS },
      { icon: ShoppingBag, label: 'Orders', path: ROUTES.ADMIN_ORDERS },
      { icon: Tag, label: 'Categories', path: ROUTES.ADMIN_CATEGORIES },
    ],
  },
  {
    section: 'MODERATE',
    items: [
      { icon: Star, label: 'Reviews', path: ROUTES.ADMIN_REVIEWS },
    ],
  },
  {
    section: 'BROADCAST',
    items: [
      { icon: Bell, label: 'Notifications', path: ROUTES.ADMIN_NOTIFICATIONS },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0f0f12] flex flex-col z-50 shadow-2xl">
      {/* Admin Brand Header */}
      <div className="flex items-center space-x-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-burgundy to-burgundy-light rounded-xl flex items-center justify-center shadow-lg shadow-burgundy/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 leading-none mb-0.5">
            Dressrosa
          </p>
          <h1 className="text-base font-black text-white leading-none">Admin</h1>
        </div>
      </div>

      {/* Admin Identity */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-burgundy/20 to-burgundy-light/10 rounded-full flex items-center justify-center ring-2 ring-burgundy/20">
            <span className="text-burgundy-light font-black text-sm">
              {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.userName || 'Admin'}</p>
            <p className="text-[10px] font-semibold text-burgundy-light uppercase tracking-widest">● Administrator</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {group.section && (
              <p className="px-4 mb-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.25em]">
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
                        ? 'bg-gradient-to-r from-burgundy to-burgundy-light text-white shadow-lg shadow-burgundy/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div className="flex items-center space-x-3.5">
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      <span>{item.label}</span>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — Sign Out */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
          <span>Sign Out</span>
        </button>
        <p className="text-center text-[10px] text-gray-700 font-medium mt-2">
          Dressrosa Admin v1.0
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
