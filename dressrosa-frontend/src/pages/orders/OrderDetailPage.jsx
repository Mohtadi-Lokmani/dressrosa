import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Banknote, X, Lock } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import PaymentModal from '../../components/checkout/PaymentModal';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await orderService.cancelOrder(id);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrder(); // Refresh order
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading order details..." />;
  }

  if (!order) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </Container>
    );
  }

  const canCancel = order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PROCESSING;
  const statusColor = getStatusColor(order.status);
  const orderItems = order.items || order.orderItems || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.orderId}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>
            <Badge variant={statusColor.variant} size="lg">
              {order.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Cancel Button */}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.detailId || `${item.productId}-${item.variantId || 'no-variant'}`}
                    className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <Link
                      to={`/products/${item.productId || item.product?.productId}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.productImage || item.product?.media?.[0]?.url || 'https://via.placeholder.com/80'}
                        alt={item.productTitle || item.product?.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId || item.product?.productId}`}
                        className="block"
                      >
                        <h3 className="font-medium text-gray-900 hover:text-burgundy transition-colors">
                          {item.productTitle || item.product?.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Seller: {order.sellerName || 'Seller'}
                      </p>
                      {(item.variant || item.size || item.color) && (
                        <p className="text-sm text-gray-500 mt-1">
                          {(item.size || item.variant?.size) && `Size: ${item.size || item.variant?.size}`}
                          {(item.size || item.variant?.size) && (item.color || item.variant?.color) && ' • '}
                          {(item.color || item.variant?.color) && `Color: ${item.color || item.variant?.color}`}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.totalPrice || ((item.price || 0) * (item.quantity || 0)))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              <OrderTimeline status={order.status} orderDate={order.orderDate} />
            </div>
          </div>

          {/* Right - Summary & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.totalAmount * 0.87)} {/* Approximation */}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(10)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.totalAmount * 0.03)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-burgundy">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-burgundy" />
                <h3 className="font-semibold text-gray-900">Shipping Address</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-5 h-5 text-burgundy" />
                <h3 className="font-semibold text-gray-900">Payment</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {order.paymentMethod === 'BANK_CARD'
                    ? <CreditCard className="w-4 h-4 text-gray-400" />
                    : <Banknote className="w-4 h-4 text-gray-400" />}
                  <p className="text-gray-700 text-sm font-medium">
                    {order.paymentMethod === 'BANK_CARD' ? 'Bank Card' : 'Cash on Delivery'}
                  </p>
                </div>
                {/* Payment status badge */}
                {order.paymentStatus && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>{order.paymentStatus}</span>
                )}
              </div>
              {/* Retry payment button for unpaid card orders */}
              {order.paymentMethod === 'BANK_CARD' && order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-4 w-full flex items-center justify-center space-x-2 py-3 bg-burgundy text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-burgundy-dark transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Complete Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Order"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </Button>
              <Button
                variant="danger"
                loading={cancelling}
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </Modal>

        {showPaymentModal && order && (
          <PaymentModal
            order={order}
            onPaymentSuccess={() => { setShowPaymentModal(false); fetchOrder(); toast.success('Payment confirmed!'); }}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </Container>
    </div>
  );
};

// Order Timeline Component
const OrderTimeline = ({ status, orderDate }) => {
  const steps = [
    { key: ORDER_STATUS.PENDING, label: 'Order Placed', icon: Package },
    { key: ORDER_STATUS.PROCESSING, label: 'Processing', icon: Package },
    { key: ORDER_STATUS.SHIPPED, label: 'Shipped', icon: Package },
    { key: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: Package },
  ];

  const statusIndex = steps.findIndex(step => step.key === status);
  const isCancelled = status === ORDER_STATUS.CANCELLED;

  return (
    <div className="space-y-4">
      {isCancelled ? (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
          <X className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-semibold text-red-900">Order Cancelled</p>
            <p className="text-sm text-red-600">This order has been cancelled</p>
          </div>
        </div>
      ) : (
        steps.map((step, index) => {
          const isCompleted = index <= statusIndex;
          const isCurrent = index === statusIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-burgundy text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-2 transition-colors ${
                      isCompleted ? 'bg-burgundy' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
              <div className="flex-1 pt-2">
                <p
                  className={`font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(orderDate)}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrderDetailPage;