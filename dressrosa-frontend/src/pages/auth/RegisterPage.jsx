import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { ROLES } from '../../utils/constants';
import { ShoppingBag, Palette } from 'lucide-react';
import './authBotanical.css';

const img = (file) => `${import.meta.env.BASE_URL}assets/images/${file}`;

const PASSWORD_RULES_HINT =
  'Use at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.';

function validatePasswordStrength(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/\d/.test(password)) return 'Password must include at least one number.';
  return '';
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    role: ROLES.BUYER,
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    telephone: '',
    address: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'That does not look like a valid email address. Check the format and try again.';
    }

    const pwMsg = validatePasswordStrength(formData.password);
    if (pwMsg) newErrors.password = pwMsg;

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'The passwords you entered do not match.';
    }

    if (formData.role === ROLES.SELLER) {
      if (!formData.shopName.trim()) newErrors.shopName = 'Atelier name is required.';
      if (!formData.telephone.trim()) {
        newErrors.telephone = 'Contact line is required.';
      } else if (formData.telephone.replace(/\s/g, '').length < 8) {
        newErrors.telephone = 'Enter a phone number with at least 8 digits.';
      }
      if (!formData.address.trim()) newErrors.address = 'Workshop location is required.';
      if (!formData.bio.trim()) newErrors.bio = 'Artisan signature is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapServerMessageToFields = (message) => {
    const m = (message || '').toLowerCase();
    if (m.includes('phone') || m.includes('telephone') || m.includes('contact line')) {
      setErrors((prev) => ({
        ...prev,
        telephone: 'This phone number is already registered. Please use a different number.',
      }));
      return;
    }
    if (m.includes('email')) {
      setErrors((prev) => ({
        ...prev,
        email: 'This email is already registered. Sign in or use another address.',
      }));
      return;
    }
    if (m.includes('password')) {
      setErrors((prev) => ({ ...prev, password: message }));
      return;
    }
    setErrors((prev) => ({ ...prev, _form: message || 'Registration could not be completed.' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setErrors((prev) => ({ ...prev, _form: '' }));

    if (!validate()) {
      toast.error('Please fix the errors below before continuing.');
      return;
    }

    try {
      const { confirmPassword, ...registerPayload } = formData;
      const payload = {
        ...registerPayload,
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        shopName: formData.shopName.trim() || undefined,
        address: formData.address.trim() || undefined,
        bio: formData.bio.trim() || undefined,
      };
      if (formData.role === ROLES.SELLER) {
        payload.telephone = formData.telephone.trim();
      } else {
        delete payload.telephone;
      }
      await register(payload);
      toast.success('Account successfully cultivated!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (typeof msg === 'string' && msg.trim()) {
        mapServerMessageToFields(msg);
        toast.error(msg);
      } else {
        toast.error('Registration could not be completed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-botanical-page min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-botanical-florals" aria-hidden="true">
        <img src={img('rose_left_vertical.png')} alt="" className="auth-floral-left-vertical" />
        <img src={img('vintage_roses_right.png')} alt="" className="auth-floral-right-hanging" />
        <img src={img('rose_bottom_corner.png')} alt="" className="auth-floral-bottom-corner" />
      </div>

      <div className="absolute top-0 w-full flex justify-between items-center px-8 py-6 z-20">
        <Link
          to="/"
          className="text-2xl font-serif font-medium text-burgundy italic cursor-pointer relative group"
        >
          Dressrosa
          <div className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-burgundy transition-all duration-300 group-hover:w-full" />
        </Link>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500">Already have an account?</span>
          <Link to="/login" className="text-burgundy font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[600px] bg-white rounded-[2rem] shadow-2xl shadow-burgundy/5 p-10 sm:p-14 border border-rose-50/50">
        <div className="mb-10 text-left">
          <h2 className="text-4xl font-serif text-gray-900 mb-3 tracking-tight">Join the Garden</h2>
          <p className="text-gray-500 text-sm font-light">Choose your path within the House of Dressrosa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: ROLES.BUYER })}
              className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 ${
                formData.role === ROLES.BUYER
                  ? 'bg-[#f4d7d7] border-[#f4d7d7] shadow-sm'
                  : 'bg-[#fdfaf9] border-gray-100 hover:border-gray-200 hover:bg-white'
              }`}
            >
              <ShoppingBag
                className={`w-5 h-5 mb-3 ${formData.role === ROLES.BUYER ? 'text-burgundy' : 'text-gray-400'}`}
              />
              <span
                className={`font-serif italic text-lg ${formData.role === ROLES.BUYER ? 'text-burgundy' : 'text-gray-600'}`}
              >
                The Collector
              </span>
              <span
                className={`text-[10px] mt-1 ${formData.role === ROLES.BUYER ? 'text-burgundy/70' : 'text-gray-400'}`}
              >
                Explore and collect fashion
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: ROLES.SELLER })}
              className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 ${
                formData.role === ROLES.SELLER
                  ? 'bg-[#f4eed7] border-[#f4eed7] shadow-sm'
                  : 'bg-[#fdfaf9] border-gray-100 hover:border-gray-200 hover:bg-white'
              }`}
            >
              <Palette
                className={`w-5 h-5 mb-3 ${formData.role === ROLES.SELLER ? 'text-green-800' : 'text-gray-400'}`}
              />
              <span
                className={`font-serif italic text-lg ${formData.role === ROLES.SELLER ? 'text-green-800' : 'text-gray-600'}`}
              >
                The Artisan
              </span>
              <span
                className={`text-[10px] mt-1 ${formData.role === ROLES.SELLER ? 'text-green-800/70' : 'text-gray-400'}`}
              >
                Create and sell fashion
              </span>
            </button>
          </div>

          {(authError || errors._form) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100">
              {errors._form || authError}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">
                Full NAME
              </label>
              <input
                type="text"
                name="userName"
                placeholder="Enter your full name"
                value={formData.userName}
                onChange={handleChange}
                autoComplete="name"
                className={`border-b ${errors.userName ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
              />
              {errors.userName && <span className="text-[10px] text-red-500 mt-1.5">{errors.userName}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">EMAIL</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`border-b ${errors.email ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
              />
              {errors.email && <span className="text-[10px] text-red-500 mt-1.5">{errors.email}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">Password</label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`border-b ${errors.password ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
              />
              <p className="text-[10px] text-[#b49891]/90 mt-2 leading-relaxed">{PASSWORD_RULES_HINT}</p>
              {errors.password && <span className="text-[10px] text-red-500 mt-1.5">{errors.password}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">
                Confirm Cipher Key
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={`border-b ${errors.confirmPassword ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
              />
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 mt-1.5">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          {formData.role === ROLES.SELLER && (
            <div className="pt-8 mt-8 border-t border-rose-50 space-y-6 animate-fade-in">
              <div className="flex flex-col">
                <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">
                  Atelier Name
                </label>
                <input
                  type="text"
                  name="shopName"
                  placeholder="Your brand name"
                  value={formData.shopName}
                  onChange={handleChange}
                  className={`border-b ${errors.shopName ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
                />
                {errors.shopName && <span className="text-[10px] text-red-500 mt-1.5">{errors.shopName}</span>}
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-1">
                  Contact Line
                </label>
                <span className="text-[10px] text-[#b49891]/80 mb-2">Needed for delivery</span>
                <input
                  type="tel"
                  name="telephone"
                  placeholder=""
                  value={formData.telephone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className={`border-b ${errors.telephone ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
                />
                {errors.telephone && <span className="text-[10px] text-red-500 mt-1.5">{errors.telephone}</span>}
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-1">
                  Workshop Location
                </label>
                <span className="text-[10px] text-[#b49891]/80 mb-2">Needed for logistics</span>
                <input
                  type="text"
                  name="address"
                  placeholder=""
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  className={`border-b ${errors.address ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
                />
                {errors.address && <span className="text-[10px] text-red-500 mt-1.5">{errors.address}</span>}
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">
                  Artisan Signature
                </label>
                <input
                  type="text"
                  name="bio"
                  placeholder="Describe your style in a few words"
                  value={formData.bio}
                  onChange={handleChange}
                  className={`border-b ${errors.bio ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
                />
                {errors.bio && <span className="text-[10px] text-red-500 mt-1.5">{errors.bio}</span>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6a0d24] text-white font-bold tracking-[0.2em] text-[11px] uppercase py-4 rounded-full mt-10 hover:bg-[#800020] transition-colors shadow-xl shadow-burgundy/20 active:scale-[0.99] disabled:opacity-70 flex justify-center items-center space-x-2"
          >
            <span>{loading ? 'Cultivating...' : 'CULTIVATE ACCOUNT'}</span>
            {!loading && <span className="font-serif italic text-sm ml-1">⚘</span>}
          </button>

          <div className="mt-10 text-center relative pt-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-rose-100" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#b49891] font-bold mb-5 bg-white inline-block px-4 relative -top-[45px]">
              Or authenticate via
            </p>
            <div className="flex justify-center space-x-4 -mt-6">
              <button
                type="button"
                className="w-12 h-12 bg-[#fdfaf9] rounded-full border border-rose-50 flex items-center justify-center hover:bg-rose-50 transition-colors shadow-sm"
              >
                <span className="font-serif font-bold text-gray-800 text-lg">G</span>
              </button>
              <button
                type="button"
                className="w-12 h-12 bg-[#fdfaf9] rounded-full border border-rose-50 flex items-center justify-center hover:bg-rose-50 transition-colors shadow-sm"
              >
                <span className="font-serif font-bold text-gray-800 text-lg">A</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
