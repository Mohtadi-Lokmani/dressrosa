import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  Users, 
  ShieldCheck
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin, loading, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success('Logged in with Google successfully!');
      if (data?.role === 'ADMIN' || data?.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed.');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email or username is required.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setErrors({});

    if (!validate()) {
      return;
    }

    try {
      const data = await login(formData.email.trim(), formData.password);
      toast.success('Welcome back to Dressrosa!');
      if (data?.role === 'ADMIN' || data?.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect credentials. Please try again.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  // User's New Logo Component
  const BrandLogo = ({ className = "w-12 h-12" }) => (
    <div className={`${className} bg-[#7A0026] rounded-[22%] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%] text-white">
        <path d="M50 20C65 20 75 30 75 45C75 65 55 80 50 85C45 80 25 65 25 45C25 30 35 20 50 20Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 35C58 35 63 40 63 47C63 55 55 62 50 65C45 62 37 55 37 47C37 40 42 35 50 35Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M50 85C50 85 55 78 62 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      {/* Left Section - Hero & Artistic Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FCF9F6] relative overflow-hidden flex-col p-20">
        {/* Top Header */}
        <div className="flex items-center space-x-4 mb-24 z-10">
          <BrandLogo />
          <span className="text-3xl font-serif text-[#7A0026] font-bold tracking-tight">Dressrosa</span>
        </div>

        {/* Hero Text */}
        <div className="max-w-md z-10 mb-auto relative">
          <h1 className="text-7xl font-serif text-gray-900 leading-tight mb-8 font-bold">
            Style is <br />
            <span className="italic text-[#7A0026] font-normal">your</span> story.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium opacity-80">
            Discover, connect, and shop unique fashion from talented sellers and ateliers around the world.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-start group">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                <ShoppingBag className="w-6 h-6 text-[#7A0026]" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Shop curated styles</span>
            </div>
            <div className="flex flex-col items-start group">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                <Users className="w-6 h-6 text-[#7A0026]" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Connect with fashion lovers</span>
            </div>
            <div className="flex flex-col items-start group">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                <ShieldCheck className="w-6 h-6 text-[#7A0026]" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Secure & trusted</span>
            </div>
          </div>
        </div>

        {/* Artistic Hero Image */}
        <div className="absolute right-[-8%] top-[15%] w-[65%] h-[80%] z-0">
          <div className="relative w-full h-full">
            {/* Main Artistic Image - Elegant, Sketchy/Abstract vibe */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border-[12px] border-white transform rotate-3 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200" 
                alt="Artistic Fashion Illustration" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#7A0026]/5 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 pointer-events-none grayscale">
          <img src="/assets/images/rose_bottom_corner.png" alt="" className="w-full h-full object-contain object-bottom-left" />
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Welcome Header */}
          <div className="mb-10">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-4xl font-serif text-gray-900 font-bold">Welcome back</h2>
              <BrandLogo className="w-8 h-8" />
            </div>
            <p className="text-gray-500 font-medium">Log in to continue your Dressrosa journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Input */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7A0026] transition-colors" />
                <input
                  type="text"
                  name="email"
                  placeholder="Email or username"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7A0026] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded-md peer-checked:bg-[#7A0026] peer-checked:border-[#7A0026] transition-all"></div>
                  <svg className="absolute inset-0 w-5 h-5 text-white scale-0 peer-checked:scale-100 transition-transform p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-sm font-bold text-[#7A0026] hover:text-[#5a001c] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7A0026] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#7A0026]/20 hover:bg-[#5a001c] transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">or</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              shape="pill"
              width="100%"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-10 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#7A0026] font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-8 w-full flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-6 text-xs font-semibold text-gray-400">
            <Link to="/about" className="hover:text-gray-600">About</Link>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <Link to="/help" className="hover:text-gray-600">Help</Link>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <Link to="/terms" className="hover:text-gray-600">Terms</Link>
          </div>
          <p className="text-[10px] text-gray-300 font-medium">© 2026 Dressrosa. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
