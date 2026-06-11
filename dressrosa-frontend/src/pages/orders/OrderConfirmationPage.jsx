import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Package, MapPin, Calendar, CreditCard,
  Banknote, ShoppingBag, ChevronRight, Clock
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import Container from '../../components/layout/Container';
import { formatPrice, formatDate } from '../../utils/formatters';

const PAYMENT_STATUS_CONFIG = {
  UNPAID:  { label: 'Unpaid',   color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  PENDING: { label: 'Pending',  color: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-400' },
  PAID:    { label: 'Paid',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  FAILED:  { label: 'Failed',   color: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-400' },
  REFUNDED:{ label: 'Refunded', color: 'bg-gray-50 text-gray-700 border-gray-200',    dot: 'bg-gray-400' },
};

const PaymentStatusBadge = ({ status }) => {
  const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.UNPAID;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-widest ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{cfg.label}</span>
    </span>
  );
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getById(id);
      setOrder(data);

      // Fetch payment details if card payment
      if (data.paymentMethod === 'BANK_CARD') {
        try {
          const paymentData = await paymentService.getPaymentByOrder(id);
          setPayment(paymentData);
        } catch (_) {
          // No payment record yet, fine
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-burgundy/10 border-t-burgundy rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <button onClick={() => navigate('/orders')} className="px-6 py-3 bg-burgundy text-white rounded-xl font-bold text-sm">View All Orders</button>
        </div>
      </div>
    );
  }

  const isCOD = order.paymentMethod === 'CASH_ON_DELIVERY';
  const paymentStatusKey = order.paymentStatus || (isCOD ? 'UNPAID' : 'PENDING');

  return (
    <div className="min-h-screen bg-white pb-24">
      <Container className="py-12 max-w-3xl mx-auto">

        {/* Hero confirmation */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 text-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCOD ? 'Order Confirmed!' : 'Payment Received!'}
          </h1>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
            {isCOD
              ? 'Your order is placed. Our artisan will prepare your piece shortly.'
              : 'Your payment was processed successfully. Your order is now being prepared.'}
          </p>
          <div className="inline-flex items-center space-x-2 bg-burgundy/5 border border-burgundy/10 px-6 py-3 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order</span>
            <span className="text-lg font-black text-burgundy">#{order.orderId}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-4 h-4 text-burgundy opacity-60" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Date</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{formatDate(order.orderDate)}</p>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Package className="w-4 h-4 text-burgundy opacity-60" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Status</p>
            </div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide bg-amber-50 text-amber-700">
              <Clock className="w-3 h-3" />
              <span>{order.status?.replace('_', ' ')}</span>
            </span>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <CreditCard className="w-4 h-4 text-burgundy opacity-60" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
            </div>
            <PaymentStatusBadge status={paymentStatusKey} />
          </div>
        </div>

        {/* Payment Method Card */}
        <div className={`rounded-[1.5rem] border p-6 mb-6 flex items-center space-x-4 ${
          isCOD ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isCOD ? 'bg-amber-100' : 'bg-emerald-100'
          }`}>
            {isCOD ? <Banknote className="w-6 h-6 text-amber-700" /> : <CreditCard className="w-6 h-6 text-emerald-700" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-gray-900 mb-0.5">
              {isCOD ? 'Cash on Delivery' : 'Bank Card Payment'}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              {isCOD
                ? 'Please have the exact amount ready upon delivery.'
                : payment?.transactionId
                  ? `Transaction: ${payment.transactionId.slice(0, 20)}...`
                  : 'Payment processed securely.'}
            </p>
          </div>
          <p className="text-xl font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <ShoppingBag className="w-5 h-5 text-burgundy" />
            <h2 className="text-lg font-bold text-gray-900">Items in Your Order</h2>
          </div>
          <div className="space-y-5">
            {order.items?.map((item) => (
              <div key={item.detailId} className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                  <img
                    src={item.productImage || 'https://via.placeholder.com/64'}
                    alt={item.productTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.productTitle}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {item.size && `Size: ${item.size}`}
                    {item.color && ` · ${item.color}`}
                    {` · Qty: ${item.quantity}`}
                  </p>
                </div>
                <p className="text-sm font-black text-burgundy">{formatPrice(item.totalPrice)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-50 mt-6 pt-4 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Total</span>
            <span className="text-2xl font-black text-burgundy">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-burgundy opacity-60" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping To</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{order.shippingAddress}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto px-8 py-4 border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-gray-50 transition-all uppercase tracking-wider"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto px-8 py-4 bg-burgundy text-white rounded-2xl text-sm font-black shadow-lg shadow-burgundy/20 hover:bg-burgundy-dark transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Container>
    </div>
  );
};

export default OrderConfirmationPage;