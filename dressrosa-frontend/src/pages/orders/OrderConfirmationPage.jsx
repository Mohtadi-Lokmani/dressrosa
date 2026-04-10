import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Calendar } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatPrice, formatDate } from '../../utils/formatters';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading order..." />;
  }

  if (!order) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Button onClick={() => navigate('/orders')}>View All Orders</Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12">
        {/* Success Message */}
        <div className="bg-white rounded-xl p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <div className="inline-flex items-center space-x-2 bg-gray-100 px-6 py-3 rounded-lg">
            <span className="text-sm text-gray-600">Order Number:</span>
            <span className="text-lg font-bold text-burgundy">#{order.orderId}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Info */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-5 h-5 text-burgundy" />
              <h3 className="font-semibold text-gray-900">Order Date</h3>
            </div>
            <p className="text-gray-600">{formatDate(order.orderDate)}</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-5 h-5 text-burgundy" />
              <h3 className="font-semibold text-gray-900">Status</h3>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {order.status}
            </span>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-burgundy" />
              <h3 className="font-semibold text-gray-900">Shipping To</h3>
            </div>
            <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.orderItems?.map((item) => (
              <div key={item.orderItemId} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0">
                <img
                  src={item.product?.media?.[0]?.url || 'https://via.placeholder.com/80'}
                  alt={item.product?.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product?.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-burgundy mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span className="text-gray-900">Total:</span>
              <span className="text-burgundy">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default OrderConfirmationPage;