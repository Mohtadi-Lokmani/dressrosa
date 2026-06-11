import { useState, useEffect } from 'react';
import {
  ShoppingBag, ChevronDown, ChevronUp, Clock, CheckCircle2,
  Truck, Package, XCircle, MapPin, Phone, User, Tag, ChevronRight
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
    next: ['CONFIRMED', 'CANCELLED'],
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle2,
    next: ['SHIPPED', 'CANCELLED'],
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Truck,
    next: ['DELIVERED'],
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Package,
    next: [],
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-600 border-red-200',
    icon: XCircle,
    next: [],
  },
};

const FILTERS = ['ALL', ...Object.keys(STATUS_CONFIG)];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      <span>{cfg.label}</span>
    </span>
  );
};

const OrderRow = ({ order, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const canUpdate = !['DELIVERED', 'CANCELLED'].includes(order.status);
  const items = order.items || [];

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Summary Row */}
      <div
        className="grid grid-cols-[auto_1fr_8rem_5rem_5rem_6rem_7rem] gap-4 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Expand Toggle */}
        <button className="text-gray-400 hover:text-burgundy transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Order / Customer */}
        <div className="flex items-center space-x-3">
          {/* First product thumbnail */}
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
            {items[0]?.productImage ? (
              <img
                src={getImageUrl(items[0].productImage)}
                alt={items[0].productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">#{order.orderId}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {order.buyerName || order.otherUserName || '—'}
            </p>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>

        {/* Items count */}
        <p className="text-sm text-gray-700 font-semibold">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </p>

        {/* Total */}
        <p className="text-sm font-black text-gray-900">{formatPrice(order.totalAmount)}</p>

        {/* Status */}
        <StatusBadge status={order.status} />

        {/* Action */}
        <div className="flex justify-end" onClick={e => e.stopPropagation()}>
          {canUpdate ? (
            <button
              onClick={() => onUpdate(order)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-burgundy border border-burgundy/20 bg-burgundy/5 hover:bg-burgundy hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              <span>Update</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-xs text-gray-300 font-semibold">—</span>
          )}
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="bg-gray-50/60 border-t border-gray-100 px-6 py-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-6">

            {/* BUYER INFO */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Buyer Info</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-burgundy/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-burgundy" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Customer Name</p>
                    <p className="text-sm font-bold text-gray-900">{order.buyerName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Phone Number</p>
                    <p className="text-sm font-bold text-gray-900">{order.buyerPhone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Shipping Address</p>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{order.shippingAddress || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Products Ordered ({items.length})
              </p>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.detailId || idx} className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      {item.productImage ? (
                        <img
                          src={getImageUrl(item.productImage)}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.productTitle}</p>
                      <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                        {item.size && (
                          <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <Tag className="w-2.5 h-2.5" />
                            <span>Size: {item.size}</span>
                          </span>
                        )}
                        {item.color && (
                          <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <span>Color: {item.color}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center bg-burgundy/10 text-burgundy px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-burgundy flex-shrink-0">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    <span>{order.paymentMethod === 'BANK_CARD' ? '💳' : '💵'}</span>
                    <span>{order.paymentMethod === 'BANK_CARD' ? 'Bank Card' : 'Cash on Delivery'}</span>
                  </span>
                  <span className={`inline-flex items-center text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {order.paymentStatus || 'UNPAID'}
                  </span>
                </div>
                <p className="text-lg font-black text-gray-900">
                  Total: <span className="text-burgundy">{formatPrice(order.totalAmount)}</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const StudioOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
      buyerName: order.buyerName || order.otherUserName || 'Buyer',
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

        {/* Tip about expandable rows */}
        {orders.length > 0 && (
          <div className="bg-burgundy/5 border border-burgundy/10 rounded-xl px-4 py-2.5 mb-4 flex items-center space-x-2">
            <ChevronDown className="w-3.5 h-3.5 text-burgundy flex-shrink-0" />
            <p className="text-[11px] font-bold text-burgundy">Click any order row to expand and see full details — buyer info, phone, shipping address, and product variants.</p>
          </div>
        )}

        {/* Orders List */}
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
              <div className="grid grid-cols-[auto_1fr_8rem_5rem_5rem_6rem_7rem] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
                <div className="w-4" />
                {['Order / Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map((h, i) => (
                  <p key={h} className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</p>
                ))}
              </div>

              <div>
                {orders.map((order) => (
                  <OrderRow key={order.orderId} order={order} onUpdate={openUpdateModal} />
                ))}
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
