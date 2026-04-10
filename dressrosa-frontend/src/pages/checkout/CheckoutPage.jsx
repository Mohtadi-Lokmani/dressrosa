import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      await fetchCart();
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error('Please fill in all required shipping fields');
      return;
    }

    try {
      setPlacing(true);
      const orderData = {
        shippingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}, ${shippingAddress.country}`,
      };
      
      const order = await orderService.placeOrder(orderData);
      
      // Clear cart
      await clearCart();
      
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </Container>
    );
  }

  const items = cart?.items || [];
  const subtotal = getTotal();
  const shipping = items.length > 0 ? 10 : 0; // Flat shipping rate
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <Container className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some products before checking out"
          actionLabel="Continue Shopping"
          onAction={() => navigate('/shop')}
        />
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-burgundy/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-burgundy" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              </div>

              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                  <Input
                    label="State/Province"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP/Postal Code"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-burgundy/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-burgundy" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600">Payment integration coming soon</p>
                <p className="text-sm text-gray-500 mt-1">Cash on delivery for now</p>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex items-start space-x-3">
                    <img
                      src={item.product?.media?.[0]?.url || 'https://via.placeholder.com/60'}
                      alt={item.product?.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.product?.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-burgundy mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-gray-900">{formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-burgundy">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="mt-6"
                loading={placing}
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;