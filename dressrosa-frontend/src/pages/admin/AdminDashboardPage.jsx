import { useState, useEffect } from 'react';
import { 
  Users, Package, ShoppingBag, DollarSign, 
  MessageSquare, Star, ArrowUpRight, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, description, trend, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
            Loading Admin Command...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
              Platform Overview
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Control center for Dressrosa global metrics, users, and moderation</p>
          </div>
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-white text-xs font-black border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            Refresh Metrics
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats?.totalRevenue || 0)}
            trend={stats?.monthRevenue > 0 ? `${formatPrice(stats.monthRevenue)} this month` : null}
            icon={DollarSign}
            colorClass="bg-burgundy/10 text-burgundy"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            trend={stats?.newOrdersThisWeek > 0 ? `+${stats.newOrdersThisWeek} new` : null}
            description={`${stats?.pendingOrders || 0} pending processing`}
            icon={ShoppingBag}
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            trend={stats?.newUsersThisWeek > 0 ? `+${stats.newUsersThisWeek} new` : null}
            description={`${stats?.totalSellers || 0} Ateliers, ${stats?.totalBuyers || 0} Buyers`}
            icon={Users}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            trend={stats?.newProductsThisWeek > 0 ? `+${stats.newProductsThisWeek} new` : null}
            description={`${stats?.totalCategories || 0} active categories`}
            icon={Package}
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Action Panel / Quick Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Quick Administrative Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="/admin/users"
                className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-burgundy/5 hover:border-burgundy/20 transition-all group"
              >
                <div className="p-3 bg-burgundy/10 text-burgundy rounded-lg group-hover:bg-burgundy/20 transition-colors mr-4">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Manage Users</h4>
                  <p className="text-xs text-gray-500">Verify sellers or delete accounts</p>
                </div>
              </a>
              <a 
                href="/admin/products"
                className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-amber-50/50 hover:border-amber-200 transition-all group"
              >
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors mr-4">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Moderate Products</h4>
                  <p className="text-xs text-gray-500">View or remove flagged product items</p>
                </div>
              </a>
              <a 
                href="/admin/notifications"
                className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all group"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors mr-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Send Announcement</h4>
                  <p className="text-xs text-gray-500">Send alerts to buyers or sellers</p>
                </div>
              </a>
              <a 
                href="/admin/reviews"
                className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-red-50/50 hover:border-red-200 transition-all group"
              >
                <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors mr-4">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Moderate Reviews</h4>
                  <p className="text-xs text-gray-500">Audit product comments & reviews</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">System Overview</h3>
                <span className="flex items-center text-[10px] font-black bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                System operations are currently fully functional. Security configurations are locked under role guards.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <span className="font-bold text-gray-700">Total Reviews</span>
                  <span className="font-black text-gray-900">{stats?.totalReviews || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <span className="font-bold text-gray-700">Active Categories</span>
                  <span className="font-black text-gray-900">{stats?.totalCategories || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 font-bold">
              <span>DB Status: Connected</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
