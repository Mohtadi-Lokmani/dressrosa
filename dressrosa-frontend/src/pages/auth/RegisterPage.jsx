import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { ROLES } from '../../utils/constants';
import { 
  ShoppingBag, Heart, ShieldCheck, 
  TrendingUp, Users, CheckCircle, 
  User, Mail, Lock, Eye, EyeOff, 
  ChevronDown, Search, Globe
} from 'lucide-react';

const img = (file) => `${import.meta.env.BASE_URL}assets/images/${file}`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    role: ROLES.BUYER,
    userName: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    // Seller specific
    shopName: '',
    category: '',
    businessType: 'Individual',
    country: 'Tunisia',
    state: '',
    city: '',
    bio: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const { confirmPassword, ...registerPayload } = formData;
      const payload = {
        ...registerPayload,
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        shopName: formData.role === ROLES.SELLER ? formData.shopName.trim() : undefined,
        city: formData.role === ROLES.SELLER ? formData.city.trim() : undefined,
        bio: formData.role === ROLES.SELLER ? formData.bio.trim() : undefined,
        // map other fields as needed for backend
      };
      await register(payload);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  const isSeller = formData.role === ROLES.SELLER;

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex font-sans text-gray-800">
      
      {/* Left Side - Content & Collage */}
      <div className="hidden lg:flex w-[55%] relative p-12 flex-col justify-between overflow-hidden">
        
        {/* Background Florals */}
        <div className="absolute -bottom-20 -left-20 w-96 opacity-40 pointer-events-none">
           <img src={img('rose_bottom_corner.png')} alt="Floral decoration" className="w-full object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
        </div>

        {/* Header / Logo */}
        <div className="relative z-10 flex items-center space-x-2 mb-16">
          <h1 className="text-3xl font-serif text-[#7A0026] tracking-tight">Dressrosa</h1>
          <img src={img('rose_bottom_corner.png')} className="w-6 h-6 object-cover rounded-full" alt="rose" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-4xl font-serif text-gray-900 mb-4 leading-tight">
            Join Dressrosa <br />
            as a <span className="text-[#7A0026] italic font-semibold">{isSeller ? 'Seller' : 'Buyer'}</span>
          </h2>
          <p className="text-gray-600 mb-12 leading-relaxed">
            {isSeller 
              ? 'Reach thousands of fashion lovers and grow your business with us.'
              : 'Discover unique fashion from trusted sellers and shop with confidence.'}
          </p>

          <div className="space-y-8">
            {isSeller ? (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#7A0026] shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Grow your brand</h4>
                    <p className="text-xs text-gray-500">Showcase your unique style.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#7A0026] shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Reach more customers</h4>
                    <p className="text-xs text-gray-500">Connect with a global audience.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#7A0026] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Safe & secure platform</h4>
                    <p className="text-xs text-gray-500">We've got you covered.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#7A0026] shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Shop from trusted sellers</h4>
                    <p className="text-xs text-gray-500">Find style that speaks to you.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#7A0026] shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Save your favorites</h4>
                    <p className="text-xs text-gray-500">Keep track of what you love.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#7A0026] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Secure & easy payments</h4>
                    <p className="text-xs text-gray-500">Your security is our priority.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Artistic Hero Image - Single Photo like Login */}
        <div className="absolute right-[-8%] top-[15%] w-[65%] h-[80%] z-0 pointer-events-none hidden xl:block">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border-[12px] border-white transform rotate-3 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200" 
                alt="Artistic Fashion Illustration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#7A0026]/5 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Terms (Left Side) */}
        <div className="relative z-10 mt-auto pt-10 text-[11px] text-gray-500">
          By signing up, you agree to our <Link to="/terms" className="underline hover:text-[#7A0026]">Terms & Conditions</Link> and <Link to="/privacy" className="underline hover:text-[#7A0026]">Privacy Policy</Link>.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative z-20 bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.02)] overflow-y-auto">
        <div className="w-full max-w-md my-auto pb-10">
          
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-serif text-gray-900">
                {isSeller ? 'Create your seller account' : 'Create your account'}
              </h2>
              <Globe className="w-5 h-5 text-[#7A0026] opacity-80" />
            </div>
            <p className="text-sm text-gray-500">
              {isSeller ? 'Start selling and build your fashion brand.' : 'Join as a buyer and start your fashion journey.'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-50 p-1 rounded-xl mb-8 border border-gray-100">
            <button
              type="button"
              onClick={() => handleRoleChange(ROLES.BUYER)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isSeller ? 'bg-[#FAF2F4] text-[#7A0026] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange(ROLES.SELLER)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isSeller ? 'bg-[#FAF2F4] text-[#7A0026] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Seller</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSeller && (
              <h3 className="text-xs font-bold text-[#7A0026] uppercase tracking-wide mb-2">Personal Information</h3>
            )}

            {/* Common Fields */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text" name="userName" placeholder="Full Name"
                value={formData.userName} onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="email" name="email" placeholder="Email Address"
                value={formData.email} onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <input
                type="tel" name="telephone" placeholder="Phone Number"
                value={formData.telephone} onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'} name="password" placeholder="Password"
                value={formData.password} onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password"
                value={formData.confirmPassword} onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Seller Extra Fields */}
            {isSeller && (
              <div className="space-y-4 pt-4 mt-4 border-t border-gray-50">
                <h3 className="text-xs font-bold text-[#7A0026] uppercase tracking-wide mb-2">Store Information</h3>
                
                <input
                  type="text" name="shopName" placeholder="Store Name"
                  value={formData.shopName} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
                />

                <div className="space-y-3">
                  <span className="text-xs text-gray-500 block">Store Location</span>
                  <input
                    type="text" name="city" placeholder="City"
                    value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-xs text-gray-500 block">Artisan Signature (Bio)</span>
                  <textarea
                    name="bio" placeholder="Describe your artisanal style..."
                    value={formData.bio} onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7A0026] focus:ring-1 focus:ring-[#7A0026]/20 transition-all placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-start space-x-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#7A0026] focus:ring-[#7A0026]" 
              />
              <label htmlFor="terms" className="text-xs text-gray-500">
                I agree to the <Link to="/terms" className="text-[#7A0026] font-semibold hover:underline">Terms & Conditions</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7A0026] text-white py-3.5 rounded-xl font-medium text-sm hover:bg-[#5a001c] transition-all disabled:opacity-70 mt-4"
            >
              {loading ? 'Processing...' : (isSeller ? 'Create Seller Account' : 'Create Account')}
            </button>
            
            <div className="relative py-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative bg-white px-4 text-xs text-gray-400">or</div>
            </div>

            <div className="space-y-3">
              <button type="button" className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              
            </div>

            <p className="text-center text-sm text-gray-500 mt-8 pt-4">
              Already have an account? <Link to="/login" className="text-[#7A0026] font-bold hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

