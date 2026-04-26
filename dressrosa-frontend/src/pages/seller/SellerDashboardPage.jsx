import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  Users,
  Eye,
  Heart,
  Plus 
} from 'lucide-react';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const SellerDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalViews: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashboardData = await userService.getSellerDashboard();
      setStats({
        totalRevenue: dashboardData.totalRevenue || 0,
        totalOrders: dashboardData.totalOrders || 0,
        totalProducts: dashboardData.totalProducts || 0,
        totalViews: dashboardData.totalViews || 0,
        pendingOrders: dashboardData.pendingOrders || 0,
        completedOrders: dashboardData.completedOrders || 0,
      });

      // Fetch recent orders
      const ordersResponse = await orderService.getMySales({ page: 0, size: 5 });
      setRecentOrders(ordersResponse.content || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your store and track performance</p>
          </div>
          <Link to="/seller/products/add">
            <Button variant="primary" icon={Plus}>
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatPrice(stats.totalRevenue)}
            </p>
            <p className="text-sm text-green-600 mt-2">+12% from last month</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.pendingOrders} pending
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            <Link to="/seller/products" className="text-sm text-burgundy mt-2 inline-block">
              Manage inventory →
            </Link>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Views</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
            <p className="text-sm text-gray-500 mt-2">All time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/seller/products/add"
            className="bg-white rounded-xl p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-burgundy" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Product</h3>
                <p className="text-sm text-gray-600">List new item</p>
              </div>
            </div>
          </Link>

          <Link
            to="/seller/products"
            className="bg-white rounded-xl p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Products</h3>
                <p className="text-sm text-gray-600">Manage inventory</p>
              </div>
            </div>
          </Link>

          <Link
            to="/studio/orders"
            className="bg-white rounded-xl p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Sales</h3>
                <p className="text-sm text-gray-600">View orders</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/studio/orders" className="text-burgundy hover:text-burgundy-dark text-sm font-medium">
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link
                          to={`/orders/${order.orderId}`}
                          className="font-medium text-burgundy hover:text-burgundy-dark"
                        >
                          #{order.orderId}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {order.buyer?.userName}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusColor(order.status).variant}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SellerDashboardPage;