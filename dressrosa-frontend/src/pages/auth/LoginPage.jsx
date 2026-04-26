import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './authBotanical.css';

const img = (file) => `${import.meta.env.BASE_URL}assets/images/${file}`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'That does not look like a valid email address. Check the format and try again.';
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
      toast.error('Please fix the errors below before continuing.');
      return;
    }

    try {
      await login(formData.email.trim(), formData.password);
      toast.success('Successfully stepped into the Garden!');
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Incorrect email or password. Check your details and try again.';
      setErrors({ password: msg });
      clearError();
      toast.error(msg);
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
          <span className="text-gray-500">New to the Garden?</span>
          <Link to="/register" className="text-burgundy font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[500px] bg-white rounded-[2rem] shadow-2xl shadow-burgundy/5 p-10 sm:p-14 border border-rose-50/50">
        <div className="mb-10 text-left">
          <h2 className="text-4xl font-serif text-gray-900 mb-3 tracking-tight">Sign In</h2>
          <p className="text-gray-500 text-sm font-light">Email and password only.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-8">
            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em] mb-3">
                Email
              </label>
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

            <div className="flex flex-col relative">
              <div className="flex justify-between items-center mb-3 gap-3">
                <label className="text-[9px] uppercase font-bold text-[#b49891] tracking-[0.15em]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast('Forgot password is not available yet.')}
                  className="text-[10px] text-[#b49891] hover:text-burgundy font-semibold shrink-0"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className={`border-b ${errors.password ? 'border-red-400' : 'border-rose-100'} pb-2 focus:outline-none focus:border-burgundy text-gray-800 bg-transparent text-sm placeholder:text-rose-200/90 transition-colors duration-300`}
              />
              {errors.password && (
                <span className="text-[10px] text-red-500 mt-1.5">{errors.password}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6a0d24] text-white font-bold tracking-[0.2em] text-[11px] uppercase py-4 rounded-full mt-12 hover:bg-[#800020] transition-colors shadow-xl shadow-burgundy/20 active:scale-[0.99] disabled:opacity-70 flex justify-center items-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <span className="font-serif italic text-sm ml-1">⚘</span>}
          </button>

          <p className="text-center text-xs text-gray-500 mt-8">
            Need an account?{' '}
            <Link to="/register" className="text-burgundy font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
