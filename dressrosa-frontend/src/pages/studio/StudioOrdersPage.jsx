import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, ChevronDown, Clock, CheckCircle2,
  Truck, Package, XCircle, AlertCircle, Search
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
    next: ['CONFIRMED', 'CANCELLED'],
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle2,
    next: ['SHIPPED', 'CANCELLED'],
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700',
    icon: Truck,
    next: ['DELIVERED'],
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: Package,
    next: [],
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-600',
    icon: XCircle,
    next: [],
  },
};

const FILTERS = ['ALL', ...Object.keys(STATUS_CONFIG)];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      <span>{cfg.label}</span>
    </span>
  );
};

const StudioOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updateModal, setUpdateModal] = useState({ show: false, orderId: null, currentStatus: '', buyerName: '' });
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMySales({ page: currentPage, size: 15, sort: 'orderDate,desc' });
      let items = response.content || response || [];
      if (statusFilter !== 'ALL') {
        items = items.filter((o) => o.status === statusFilter);
      }
      setOrders(items);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || items.length);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setUpdateModal({
      show: true,
      orderId: order.orderId,
      currentStatus: order.status,
      buyerName: order.buyer?.userName || 'Buyer',
    });
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await orderService.updateStatus(updateModal.orderId, newStatus);
      toast.success('Order status updated!');
      setUpdateModal({ show: false, orderId: null, currentStatus: '', buyerName: '' });
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Summary counts
  const countByStatus = (status) => orders.filter((o) => o.status === status).length;
  const totalRevenue = orders
    .filter((o) => o.status !== ORDER_STATUS.CANCELLED)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all incoming buyer orders</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Pending', value: countByStatus('PENDING'), color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Shipped', value: countByStatus('SHIPPED'), color: 'text-purple-700', bg: 'bg-purple-50' },
            { label: 'Delivered', value: countByStatus('DELIVERED'), color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl px-5 py-4 border border-white`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5 flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => {
            const cfg = STATUS_CONFIG[f];
            return (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setCurrentPage(0); }}
                className={`flex-shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f
                    ? 'bg-burgundy text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cfg && <cfg.icon className="w-3.5 h-3.5" />}
                <span>{cfg?.label ?? 'All Orders'}</span>
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-bold text-gray-700 mb-1">No orders yet</p>
              <p className="text-sm text-gray-400">Orders from buyers will appear here once placed.</p>
            </div>
          ) : (
            <>
              {/* Table Head */}
              <div className="grid grid-cols-[1fr_8rem_5rem_5rem_7rem_7rem] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                {['Order / Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map((h, i) => (
                  <p key={h} className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</p>
                ))}
              </div>

              <div className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const canUpdate = !['DELIVERED', 'CANCELLED'].includes(order.status);
                  return (
                    <div
                      key={order.orderId}
                      className="grid grid-cols-[1fr_8rem_5rem_5rem_7rem_7rem] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Order / Customer */}
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          #{order.orderId}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.buyer?.userName || '—'}
                        </p>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>

                      {/* Items */}
                      <p className="text-sm text-gray-700 font-semibold">
                        {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                      </p>

                      {/* Total */}
                      <p className="text-sm font-black text-gray-900">{formatPrice(order.totalAmount)}</p>

                      {/* Status */}
                      <StatusBadge status={order.status} />

                      {/* Action */}
                      <div className="flex justify-end">
                        {canUpdate ? (
                          <button
                            onClick={() => openUpdateModal(order)}
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-burgundy border border-burgundy/20 bg-burgundy/5 hover:bg-burgundy hover:text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            <span>Update</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 font-semibold">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-50">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateModal.show}
        onClose={() => setUpdateModal({ show: false, orderId: null, currentStatus: '', buyerName: '' })}
        title={`Update Order #${updateModal.orderId}`}
      >
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-5">
            Order from <span className="font-bold text-gray-900">{updateModal.buyerName}</span> — currently <StatusBadge status={updateModal.currentStatus} />
          </p>

          <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-3">
            New Status
          </label>
          <div className="space-y-2 mb-6">
            {(STATUS_CONFIG[updateModal.currentStatus]?.next || []).map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <label key={s} className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  newStatus === s ? 'border-burgundy/30 bg-burgundy/5' : 'border-gray-100 hover:border-gray-200'
                }`}>
                  <input type="radio" name="newStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-burgundy" />
                  <cfg.icon className={`w-4 h-4 ${newStatus === s ? 'text-burgundy' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${newStatus === s ? 'text-gray-900' : 'text-gray-600'}`}>{cfg.label}</span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={() => setUpdateModal({ show: false, orderId: null, currentStatus: '', buyerName: '' })}>
              Cancel
            </Button>
            <Button variant="primary" loading={updating} onClick={handleUpdateStatus} disabled={newStatus === updateModal.currentStatus}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudioOrdersPage;
