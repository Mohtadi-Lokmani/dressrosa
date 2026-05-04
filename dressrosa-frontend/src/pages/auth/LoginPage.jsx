import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
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
  const { login, loading, clearError } = useAuthStore();

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
      await login(formData.email.trim(), formData.password);
      toast.success('Welcome back to Dressrosa!');
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect credentials. Please try again.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  // User's New Logo Component
  const BrandLogo = ({ className = "w-12 h-12" }) => (
    <div className={`${className} bg-burgundy rounded-[22%] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0`}>
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
          <span className="text-3xl font-serif text-burgundy font-bold tracking-tight">Dressrosa</span>
        </div>

        {/* Hero Text */}
        <div className="max-w-md z-10 mb-auto relative">
          <h1 className="text-7xl font-serif text-gray-900 leading-tight mb-8 font-bold">
            Style is <br />
            <span className="italic text-burgundy font-normal">your</span> story.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium opacity-80">
            Discover, connect, and shop unique fashion from talented sellers and ateliers around the world.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-start group">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                <ShoppingBag className="w-6 h-6 text-burgundy" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Shop curated styles</span>
            </div>
            <div className="flex flex-col items-start group">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                <Users className="w-6 h-6 text-burgundy" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Connect with fashion lovers</span>
            </div>
            <div className="flex flex-col items-start group">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                <ShieldCheck className="w-6 h-6 text-burgundy" />
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
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy/5 to-transparent"></div>
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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-burgundy transition-colors" />
                <input
                  type="text"
                  name="email"
                  placeholder="Email or username"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-burgundy transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
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
                  <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded-md peer-checked:bg-burgundy peer-checked:border-burgundy transition-all"></div>
                  <svg className="absolute inset-0 w-5 h-5 text-white scale-0 peer-checked:scale-100 transition-transform p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-sm font-bold text-burgundy hover:text-burgundy-dark transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy text-white py-4 rounded-2xl font-bold shadow-lg shadow-burgundy/20 hover:bg-burgundy-dark transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all transform active:scale-[0.99]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold text-gray-700">Continue with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-10 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-burgundy font-bold hover:underline">
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
