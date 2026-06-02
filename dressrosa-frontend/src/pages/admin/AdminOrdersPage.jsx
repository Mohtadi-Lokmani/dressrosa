import { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, ChevronLeft, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatPrice } from '../../utils/formatters';
import { formatDate } from 'date-fns';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        status: status || undefined,
      };
      const data = await adminService.getOrders(params);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'SHIPPED': return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'DELIVERED': return 'bg-green-50 text-green-700 border border-green-100';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Audit transaction details and override order dispatch status ({totalElements} orders total)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Filter transactions
          </div>

          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy transition-all font-semibold text-gray-600"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Transactions...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500">No orders found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID & Date</th>
                    <th className="px-6 py-4">Buyer Info</th>
                    <th className="px-6 py-4">Seller Info</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {orders.map((item) => (
                    <tr key={item.orderId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">#{item.orderId}</p>
                          <p className="text-xs text-gray-400">
                            {item.orderDate ? formatDate(new Date(item.orderDate), 'MMM dd, yyyy HH:mm') : '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{item.buyerName || '—'}</p>
                          <p className="text-xs text-gray-400">{item.buyerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{item.sellerName || '—'}</p>
                          {item.sellerShopName && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.sellerShopName}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900">{formatPrice(item.totalAmount)}</span>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.itemCount} items</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-500">
                          {item.paymentMethod?.replace(/_/g, ' ') || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          item.paymentStatus === 'PAID' ? 'badge-success' : 'badge-danger'
                        } text-[10px] font-black`}>
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.orderId, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black focus:outline-none transition-all ${getStatusBadgeClass(item.status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrdersPage;
