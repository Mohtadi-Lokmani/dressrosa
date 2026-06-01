import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Calendar, SlidersHorizontal, MoreVertical, Wallet, CreditCard, Store, MapPin, ArrowRight, CircleDot, Receipt, Coins, ChartColumnBig, Clock3 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { formatPrice, formatDate } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [allOrdersForCounts, setAllOrdersForCounts] = useState([]);

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
      const fullResponse = await orderService.getMyOrders({
        page: 0,
        size: 200,
        sort: 'orderDate,desc',
      });

      let filteredOrders = response.content || [];
      
      // Filter by status if not ALL
      if (statusFilter !== 'ALL') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }

      setOrders(filteredOrders);
      setTotalPages(response.totalPages || 0);
      setAllOrdersForCounts(fullResponse.content || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All' },
    { id: ORDER_STATUS.PENDING, label: 'Pending' },
    { id: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
    { id: ORDER_STATUS.SHIPPED, label: 'Shipped' },
    { id: ORDER_STATUS.DELIVERED, label: 'Delivered' },
    { id: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
    { id: ORDER_STATUS.RETURNED, label: 'Returned' },
  ];

  const getStatusCount = (status) => {
    if (status === 'ALL') return allOrdersForCounts.length;
    return allOrdersForCounts.filter((order) => order.status === status).length;
  };

  const getStatusPillClass = (status) => {
    if (status === 'DELIVERED') return 'bg-emerald-100 text-emerald-700';
    if (status === 'SHIPPED') return 'bg-blue-100 text-blue-700';
    if (status === 'CONFIRMED') return 'bg-amber-100 text-amber-700';
    if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700';
    if (status === 'RETURNED') return 'bg-violet-100 text-violet-700';
    return 'bg-gray-100 text-gray-700';
  };

  const totalOrdersCount = allOrdersForCounts.length;
  const totalSpent = allOrdersForCounts.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const averageOrder = totalOrdersCount ? totalSpent / totalOrdersCount : 0;
  const pendingOrders = allOrdersForCounts.filter((order) => order.status === ORDER_STATUS.PENDING).length;
  const formatTnd = (value) => `${Number(value || 0).toFixed(3)} TND`;

  if (loading && currentPage === 0) {
    return <Loading fullScreen text="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Container className="py-6 lg:py-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">My Orders</h1>
          <p className="text-sm text-gray-500">Track, manage and review your purchases.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-9 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[260px] flex-1 max-w-[360px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full h-10 pl-10 pr-3 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <button className="h-10 px-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Date</span>
              </button>
              <button className="h-10 px-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 inline-flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Sort by</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-2 border border-gray-200">
              <div className="flex items-center gap-2 overflow-x-auto">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setCurrentPage(0);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      statusFilter === tab.id
                        ? 'bg-burgundy text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {getStatusCount(tab.id)}
                    </span>
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
                    (() => {
                      const orderItems = order.items || order.orderItems || [];
                      const sellerName = order.sellerName || order.otherUserName || order.seller?.userName || 'Unknown Atelier';
                      return (
                    <div key={order.orderId} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <div className="inline-flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-500" />
                              <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber || order.orderId}</h3>
                            </div>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusPillClass(order.status)}`}>
                              <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                              <span>{order.status}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Sold by <span className="font-semibold text-burgundy">{sellerName}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(order.orderDate || order.createdAt)}</p>
                          <button className="w-8 h-8 rounded-lg hover:bg-gray-100 inline-flex items-center justify-center text-gray-500">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {orderItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                              src={getImageUrl(item.productImage || item.productImageUrl || item.product?.media?.[0]?.url)}
                              alt={item.product?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {orderItems.length > 3 && (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">+{orderItems.length - 3}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-gray-100 pt-3">
                        <div className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Delivered to {order.shippingAddress || 'Address unavailable'}</span>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <Link
                            to={`/orders/${order.orderId}`}
                            className="h-9 px-5 rounded-lg bg-burgundy text-white text-sm font-semibold inline-flex items-center justify-center hover:bg-burgundy-dark transition-colors"
                          >
                            View Details
                          </Link>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-burgundy leading-none">{formatTnd(order.totalAmount)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{orderItems.length || 0} items</p>
                          </div>
                        </div>
                      </div>
                    </div>
                      );
                    })()
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
          </div>

          <div className="xl:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-[22px] font-semibold text-gray-900 mb-5 inline-flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-burgundy/10 text-burgundy inline-flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </span>
                <span>Order Summary</span>
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="inline-flex items-center gap-2"><Receipt className="w-3.5 h-3.5 text-burgundy/70" />Total Orders</span>
                  <span className="font-semibold text-gray-900">{totalOrdersCount}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="inline-flex items-center gap-2"><Coins className="w-3.5 h-3.5 text-burgundy/70" />Total Spent</span>
                  <span className="font-semibold text-gray-900">{formatTnd(totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="inline-flex items-center gap-2"><ChartColumnBig className="w-3.5 h-3.5 text-burgundy/70" />Average Order</span>
                  <span className="font-semibold text-gray-900">{formatTnd(averageOrder)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="inline-flex items-center gap-2"><Clock3 className="w-3.5 h-3.5 text-burgundy/70" />Pending Orders</span>
                  <span className="font-semibold text-gray-900">{pendingOrders}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2.5">
                <button className="w-full h-12 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between px-3.5">
                  <span className="inline-flex items-center gap-2"><CircleDot className="w-3.5 h-3.5 text-burgundy" />Track Last Order</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full h-12 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between px-3.5">
                  <span className="inline-flex items-center gap-2"><Store className="w-3.5 h-3.5 text-burgundy" />Buy Again</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">We Accept</h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-gray-200 px-2 py-3 text-center">
                  <CreditCard className="w-5 h-5 mx-auto text-blue-700 mb-1" />
                  <p className="text-[11px] text-gray-600">Visa</p>
                </div>
                <div className="rounded-lg border border-gray-200 px-2 py-3 text-center">
                  <CreditCard className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-[11px] text-gray-600">Mastercard</p>
                </div>
                <div className="rounded-lg border border-gray-200 px-2 py-3 text-center">
                  <Wallet className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                  <p className="text-[11px] text-gray-600">on Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrdersPage;