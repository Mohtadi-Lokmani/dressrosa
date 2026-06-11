import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  ArrowLeft, 
  Lock, 
  ShieldCheck,
  ChevronRight,
  Banknote,
  Truck
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';
import PaymentModal from '../../components/checkout/PaymentModal';
import { getImageUrl } from '../../utils/helpers';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrders, setCreatedOrders] = useState([]);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.userName || '',
    phone: '',
    address1: '',
    address2: '',
    governorate: '',
    city: '',
    postalCode: '',
    instructions: '',
  });

  const [errors, setErrors] = useState({});

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Required';
    if (!shippingAddress.address1.trim()) newErrors.address1 = 'Required';
    if (!shippingAddress.governorate.trim()) newErrors.governorate = 'Required';
    if (!shippingAddress.city.trim()) newErrors.city = 'Required';
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setPlacing(true);
      const orderData = {
        shippingAddress: `${shippingAddress.address1}${shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''}, ${shippingAddress.city}, ${shippingAddress.governorate}, ${shippingAddress.postalCode}`,
        paymentMethod: paymentMethod === 'cod' ? 'CASH_ON_DELIVERY' : 'BANK_CARD',
        phone: shippingAddress.phone,
        fullName: shippingAddress.fullName,
        instructions: shippingAddress.instructions
      };
      
      const response = await orderService.placeOrder(orderData);
      const orders = Array.isArray(response) ? response : [response];
      setCreatedOrders(orders);

      if (paymentMethod === 'card') {
        setShowPaymentModal(true);
        setPlacing(false);
      } else {
        await clearCart();
        toast.success('Order successfully cultivated!');
        navigate(`/order-confirmation/${orders[0].orderId}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await clearCart();
    setShowPaymentModal(false);
    navigate(`/order-confirmation/${createdOrders[0].orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-burgundy/10 border-t-burgundy rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Preparing Checkout...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = getTotal();
  const shipping = 7.000; // Fixed shipping for now
  const tax = subtotal * 0.19; // 19% as in the photo
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <Container className="py-24 bg-white">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-burgundy/5 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-burgundy opacity-20" />
          </div>
          <h2 className="text-3xl font-serif text-gray-900">Your basket is empty</h2>
          <p className="text-gray-500">Add some pieces to your collection before proceeding to checkout.</p>
          <button onClick={() => navigate('/shop')} className="w-full bg-burgundy text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-burgundy/20 hover:bg-burgundy-dark transition-all">
            Explore Collection
          </button>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Container className="py-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link to="/cart" className="flex items-center space-x-2 text-gray-400 hover:text-gray-900 transition-colors mb-3">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Back to Cart</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Complete your order by providing your details.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-900">Secure Checkout</span>
              <span className="text-[9px] text-gray-400 font-medium leading-none">Your data is protected</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-10">
          {/* LEFT: Shipping & Payment */}
          <div className="space-y-8">
            
            {/* 1. Shipping Address */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-burgundy text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-burgundy/20">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-[11px] text-gray-400 font-medium">Where should we deliver your order?</p>
                  </div>
                </div>
                <MapPin className="w-5 h-5 text-burgundy opacity-20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Full Name <span className="text-burgundy">*</span></label>
                  <input
                    type="text" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange}
                    placeholder="Ali Ben Yahya"
                    className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.fullName ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy/30 transition-all`}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Phone Number <span className="text-burgundy">*</span></label>
                  <input
                    type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange}
                    placeholder="e.g. 12 345 678"
                    className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.phone ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy/30 transition-all`}
                  />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Address Line 1 <span className="text-burgundy">*</span></label>
                  <input
                    type="text" name="address1" value={shippingAddress.address1} onChange={handleInputChange}
                    placeholder="12 Avenue Habib Bourguiba"
                    className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.address1 ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy/30 transition-all`}
                  />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Address Line 2 (Optional)</label>
                  <input
                    type="text" name="address2" value={shippingAddress.address2} onChange={handleInputChange}
                    placeholder="Appartement 4B, 2ème étage"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Governorate <span className="text-burgundy">*</span></label>
                  <input
                    type="text" name="governorate" value={shippingAddress.governorate} onChange={handleInputChange}
                    placeholder="e.g. Tunis"
                    className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.governorate ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">City <span className="text-burgundy">*</span></label>
                  <input
                    type="text" name="city" value={shippingAddress.city} onChange={handleInputChange}
                    placeholder="e.g. La Marsa"
                    className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.city ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Postal Code <span className="text-burgundy">*</span></label>
                  <input
                    type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange}
                    placeholder="1001"
                    className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.postalCode ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
                  />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Delivery Instructions (Optional)</label>
                  <textarea
                    name="instructions" value={shippingAddress.instructions} onChange={handleInputChange}
                    placeholder="e.g., Leave at the door, call before delivery..."
                    rows={3}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* 2. Payment Method */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-8 sm:p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-burgundy text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-burgundy/20">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-serif text-gray-900">Payment Method</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Select a secure payment option.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'cod' 
                      ? 'border-burgundy bg-burgundy/[0.02]' 
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'cod' ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">Cash on Delivery</p>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight">Pay in cash when your order arrives</p>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'card' 
                      ? 'border-burgundy bg-burgundy/[0.02]' 
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'card' ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">Bank Card</p>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight">Visa, Mastercard — secured checkout</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* Contextual info block */}
              <div className="mt-6">
                {paymentMethod === 'cod' ? (
                  <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-4">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Truck className="w-4.5 h-4.5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-1">Cash on Delivery Selected</p>
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Please have the exact amount ready when your delivery arrives. Our delivery partner will collect payment at your door.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lock className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-900 mb-1">Secure Card Payment</p>
                        <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                          After placing your order, you'll be prompted to enter your card details in a secure payment window. Your data is SSL-encrypted.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 pl-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-60" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-60" />
                      <div className="flex items-center space-x-1 ml-auto">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">SSL Encrypted</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-8 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-5 h-5 text-burgundy" />
                  <h2 className="text-xl font-serif text-gray-900">Order Summary</h2>
                </div>
                <span className="text-[10px] font-black text-burgundy uppercase tracking-widest bg-burgundy/5 px-3 py-1 rounded-full">
                  {items.length} items
                </span>
              </div>

              {/* Item List */}
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.cartId} className="flex items-start space-x-4 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <img
                        src={getImageUrl(item.productImage) || 'https://via.placeholder.com/100'}
                        alt={item.productTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-burgundy transition-colors line-clamp-2">
                        {item.productTitle}
                      </h4>
                      <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                        <span>Size: {item.size || 'N/A'}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="text-[13px] font-black text-burgundy">
                        {formatPrice(Number(item.itemTotal || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3.5 border-t border-gray-50 pt-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="text-xs font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping</span>
                  <span className="text-xs font-bold text-gray-900">{formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tax (19%)</span>
                  <span className="text-xs font-bold text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-lg font-serif text-gray-900">Total</span>
                  <span className="text-2xl font-black text-burgundy">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon removed */}

              {/* CTA */}
              <button
                disabled={placing}
                onClick={handlePlaceOrder}
                className="w-full bg-burgundy text-white py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-burgundy/20 hover:bg-burgundy-dark transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
              >
                {placing ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {paymentMethod === 'cod'
                      ? <Banknote className="w-4 h-4" />
                      : <Lock className="w-4 h-4" />}
                    <span>{paymentMethod === 'cod' ? 'Place Order' : 'Review & Pay'}</span>
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                  By placing your order, you agree to our<br/>
                  <Link to="/terms" className="text-burgundy hover:underline">Terms & Conditions</Link> • <Link to="/privacy" className="text-burgundy hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      {showPaymentModal && createdOrders.length > 0 && (
        <PaymentModal 
          order={createdOrders[0]} 
          onPaymentSuccess={handlePaymentSuccess} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </div>
  );
};

export default CheckoutPage;