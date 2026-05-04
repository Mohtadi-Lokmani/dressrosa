import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Filter, CreditCard, Banknote } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders({
        page: currentPage,
        size: 10,
        sort: 'orderDate,desc',
      });

      let filteredOrders = response.content || [];
      
      // Filter by status if not ALL
      if (statusFilter !== 'ALL') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }

      setOrders(filteredOrders);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const colors = getStatusColor(status);
    return colors.variant;
  };

  if (loading && currentPage === 0) {
    return <Loading fullScreen text="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-burgundy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {Object.values(ORDER_STATUS).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-burgundy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders found"
            description={
              statusFilter === 'ALL'
                ? "You haven't placed any orders yet"
                : `No orders with status: ${statusFilter}`
            }
            actionLabel={statusFilter !== 'ALL' ? 'Clear Filter' : 'Start Shopping'}
            onAction={() => {
              if (statusFilter !== 'ALL') {
                setStatusFilter('ALL');
              } else {
                window.location.href = '/shop';
              }
            }}
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.orderId}
                  to={`/orders/${order.orderId}`}
                  className="block bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderId}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                        {/* Payment status chip */}
                        {order.paymentStatus && (
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.paymentStatus === 'PENDING'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {order.paymentMethod === 'BANK_CARD' ? '💳' : '💵'} {order.paymentStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center space-x-4 mb-4">
                    {order.orderItems?.slice(0, 3).map((item, index) => (
                      <div key={index} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.product?.media?.[0]?.url || 'https://via.placeholder.com/64'}
                          alt={item.product?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.orderItems?.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          +{order.orderItems.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.orderItems?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-xl font-bold text-burgundy">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default OrdersPage;