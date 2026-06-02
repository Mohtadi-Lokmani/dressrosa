import { useState } from 'react';
import { X, Lock, CreditCard, ShieldCheck, Banknote, CheckCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

// Format card number with spaces: 1234 5678 9012 3456
const formatCardNumber = (value) => {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
};

// Format expiry: MM/YY
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const validate = ({ number, expiry, cvc, name }) => {
  const errs = {};
  if (!name.trim()) errs.name = 'Name is required';
  const rawNum = number.replace(/\s/g, '');
  if (rawNum.length < 16) errs.number = 'Enter a valid 16-digit card number';
  const [mm] = (expiry || '').split('/');
  if (!expiry || expiry.length < 5 || parseInt(mm) > 12) errs.expiry = 'Invalid expiry date';
  if (!cvc || cvc.length < 3) errs.cvc = 'Invalid CVC';
  return errs;
};

const InputField = ({ label, error, children }) => (
  <div className="flex flex-col">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{error}</p>}
  </div>
);

const PaymentModal = ({ order, product, type = "ORDER", onPaymentSuccess, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const isBoost = type === 'BOOST';
  const displayId = isBoost ? product?.productId : order?.orderId;
  const amount = isBoost ? 5 : order?.totalAmount;
  const title = isBoost ? "Boost Product" : "Secure Payment";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'number') formatted = formatCardNumber(value);
    if (name === 'expiry') formatted = formatExpiry(value);
    if (name === 'cvc') formatted = value.replace(/\D/g, '').slice(0, 3);
    setCardData(prev => ({ ...prev, [name]: formatted }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(cardData);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setProcessing(true);
      const requestPayload = isBoost 
        ? { productId: product.productId, type: 'BOOST' }
        : { orderId: order.orderId, type: 'ORDER' };
        
      const intent = await paymentService.createPaymentIntent(requestPayload);
      // Simulate processing delay (replace with real Stripe.js confirmCardPayment when ready)
      await new Promise(r => setTimeout(r, 2000));
      await paymentService.confirmPayment(intent.transactionId);
      setDone(true);
      setTimeout(() => onPaymentSuccess(), 1500);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please check your card details and try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-7 pb-4 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-burgundy rounded-2xl flex items-center justify-center shadow-lg shadow-burgundy/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-gray-900">{title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isBoost ? 'Product' : 'Order'} #{displayId}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={processing} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 disabled:opacity-30">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          /* Success State */
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-9 h-9 text-emerald-500" />
            </div>
            <h4 className="text-xl font-serif text-gray-900 mb-2">Payment Confirmed!</h4>
            <p className="text-sm text-gray-500">{isBoost ? 'Your product is now boosted for 7 days.' : 'Redirecting to your order...'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            {/* Amount */}
            <div className="bg-burgundy/[0.03] border border-burgundy/10 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</span>
              <span className="text-2xl font-black text-burgundy">{formatPrice(amount)}</span>
            </div>

            {/* Card Preview Strip */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">Card Number</p>
              <p className="font-mono text-lg font-bold tracking-[0.2em] mb-4">
                {cardData.number || '•••• •••• •••• ••••'}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Cardholder</p>
                  <p className="text-sm font-bold">{cardData.name || 'YOUR NAME'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Expires</p>
                  <p className="text-sm font-bold">{cardData.expiry || 'MM/YY'}</p>
                </div>
                <CreditCard className="w-8 h-8 opacity-30" />
              </div>
            </div>

            {/* Fields */}
            <InputField label="Cardholder Name" error={errors.name}>
              <input
                type="text" name="name" value={cardData.name} onChange={handleChange}
                placeholder="Name as on card" autoComplete="cc-name"
                className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.name ? 'border-red-300' : 'border-gray-100'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
              />
            </InputField>

            <InputField label="Card Number" error={errors.number}>
              <div className="relative">
                <input
                  type="text" name="number" value={cardData.number} onChange={handleChange}
                  placeholder="0000 0000 0000 0000" autoComplete="cc-number" inputMode="numeric"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${errors.number ? 'border-red-300' : 'border-gray-100'} rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
                />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              </div>
            </InputField>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Expiry (MM/YY)" error={errors.expiry}>
                <input
                  type="text" name="expiry" value={cardData.expiry} onChange={handleChange}
                  placeholder="MM/YY" autoComplete="cc-exp" inputMode="numeric"
                  className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.expiry ? 'border-red-300' : 'border-gray-100'} rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
                />
              </InputField>
              <InputField label="CVC" error={errors.cvc}>
                <input
                  type="password" name="cvc" value={cardData.cvc} onChange={handleChange}
                  placeholder="•••" autoComplete="cc-csc" inputMode="numeric"
                  className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.cvc ? 'border-red-300' : 'border-gray-100'} rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-burgundy/10 transition-all`}
                />
              </InputField>
            </div>

            <button
              type="submit" disabled={processing}
              className="w-full bg-burgundy text-white py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-burgundy/20 hover:bg-burgundy-dark transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
            >
              {processing
                ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                : <><Lock className="w-4 h-4" /><span>Confirm Payment</span></>}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center space-x-4 pt-1 opacity-40">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
              <span className="text-gray-300">|</span>
              <ShieldCheck className="w-4 h-4 text-gray-600" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">SSL Secured</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
