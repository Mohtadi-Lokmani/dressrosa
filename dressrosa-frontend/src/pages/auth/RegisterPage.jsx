import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { 
  ShoppingBag, Heart, ShieldCheck, 
  TrendingUp, Users, CheckCircle, 
  User, Mail, Lock, Eye, EyeOff, 
  ChevronDown, Search, Globe
} from 'lucide-react';

const img = (file) => `${import.meta.env.BASE_URL}assets/images/${file}`;

const ROLES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER'
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, googleLogin, googleCheck, loading, error: authError, clearError } = useAuthStore();

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

  const [step, setStep] = useState(1);
  const [googleToken, setGoogleToken] = useState(null);
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

  const handleContinueWithEmail = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setStep(2);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const exists = await googleCheck(credentialResponse.credential);
      
      if (exists) {
        // User already has an account, log them in immediately
        await googleLogin(credentialResponse.credential);
        toast.success('Welcome back! Logged in with Google.');
        navigate('/');
      } else {
        // New user, show Step 2 to collect role and details
        setGoogleToken(credentialResponse.credential);
        setStep(2);
        toast.success('Google account connected! Please complete your profile.');
      }
    } catch (err) {
      toast.error('Google verification failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions.');
      return;
    }

    if (formData.role === ROLES.SELLER) {
      if (!formData.shopName.trim() || !formData.city.trim()) {
        toast.error('Shop name and city are required for artisans.');
        return;
      }
    }

    try {
      if (googleToken) {
        // Google Registration Flow
        await googleLogin(googleToken, {
          role: formData.role,
          telephone: formData.telephone.trim(),
          shopName: formData.role === ROLES.SELLER ? formData.shopName.trim() : undefined,
          city: formData.role === ROLES.SELLER ? formData.city.trim() : undefined,
          bio: formData.role === ROLES.SELLER ? formData.bio.trim() : undefined,
        });
        toast.success('Registration complete! Welcome to Dressrosa.');
      } else {
        // Normal Registration Flow
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match.');
          return;
        }

        const { confirmPassword, ...registerPayload } = formData;
        const payload = {
          ...registerPayload,
          userName: formData.userName.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          shopName: formData.role === ROLES.SELLER ? formData.shopName.trim() : undefined,
          city: formData.role === ROLES.SELLER ? formData.city.trim() : undefined,
          bio: formData.role === ROLES.SELLER ? formData.bio.trim() : undefined,
        };
        await register(payload);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  const isSeller = formData.role === ROLES.SELLER;

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex font-sans text-gray-800">
      
      {/* Left Side - Content & Photo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FCF9F6] relative overflow-hidden flex-col p-20">
        
        {/* Background Florals */}
        <div className="absolute -bottom-20 -left-20 w-96 opacity-40 pointer-events-none grayscale">
           <img src={img('rose_bottom_corner.png')} alt="Floral decoration" className="w-full object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
        </div>

        {/* Header / Logo */}
        <div className="relative z-10 flex items-center space-x-4 mb-24">
          <div className="w-12 h-12 bg-[#7A0026] rounded-[22%] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%] text-white">
              <path d="M50 20C65 20 75 30 75 45C75 65 55 80 50 85C45 80 25 65 25 45C25 30 35 20 50 20Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M50 35C58 35 63 40 63 47C63 55 55 62 50 65C45 62 37 55 37 47C37 40 42 35 50 35Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M50 85C50 85 55 78 62 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-3xl font-serif text-[#7A0026] font-bold tracking-tight">Dressrosa</span>
        </div>

        <div className="relative z-10 max-w-md mb-auto">
          <h2 className="text-7xl font-serif text-gray-900 leading-tight mb-8 font-bold">
            Join <span className="italic text-[#7A0026] font-normal">Dressrosa</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium opacity-80">
            {isSeller 
              ? 'Reach thousands of fashion lovers and grow your business with us.'
              : 'Discover unique fashion from trusted sellers and shop with confidence.'}
          </p>

          <div className="grid grid-cols-3 gap-6">
            {isSeller ? (
              <>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-[#7A0026]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Grow your brand</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-[#7A0026]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reach customers</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 text-[#7A0026]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Safe & Secure</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6 text-[#7A0026]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trusted Sellers</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                    <Heart className="w-6 h-6 text-[#7A0026]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Save favorites</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 text-[#7A0026]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Secure Payments</span>
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
                src="https://metrostudio.in/wp-content/uploads/2024/10/123.111.cedaarandpine0014-1.jpg" 
                alt="Artistic Fashion Illustration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#7A0026]/5 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Terms (Left Side) */}
        <div className="absolute bottom-8 w-full flex flex-col items-start space-y-4 text-[10px] text-gray-400 font-medium z-10">
          <div className="flex items-center space-x-6">
            <span>By signing up, you agree to our</span>
            <Link to="/terms" className="underline hover:text-[#7A0026]">Terms & Conditions</Link>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <Link to="/privacy" className="underline hover:text-[#7A0026]">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-[420px] my-auto">
          
          <div className="mb-10">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-4xl font-serif text-gray-900 font-bold">
                {step === 1 ? 'Create account' : 'Almost there'}
              </h2>
              <div className="w-8 h-8 bg-[#7A0026] rounded-[22%] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%] text-white">
                  <path d="M50 20C65 20 75 30 75 45C75 65 55 80 50 85C45 80 25 65 25 45C25 30 35 20 50 20Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M50 35C58 35 63 40 63 47C63 55 55 62 50 65C45 62 37 55 37 47C37 40 42 35 50 35Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M50 85C50 85 55 78 62 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <p className="text-gray-500 font-medium">
              {googleToken 
                ? 'Tell us a bit more about how you want to use Dressrosa.'
                : step === 1 
                  ? 'Join our community of fashion lovers.' 
                  : 'Complete your profile to start your journey.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleContinueWithEmail} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7A0026] transition-colors" />
                <input
                  type="email" name="email" placeholder="Email Address"
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7A0026] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#7A0026]/20 hover:bg-[#5a001c] transform active:scale-[0.98] transition-all flex justify-center items-center"
              >
                <span>Continue with Email</span>
              </button>

              <div className="relative my-10 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative bg-white px-4 text-sm text-gray-400 font-medium">or</div>
              </div>

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
                Already have an account? <Link to="/login" className="text-[#7A0026] font-bold hover:underline">Log in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Toggle */}
              <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6 border border-gray-100">
                <button
                  type="button"
                  onClick={() => handleRoleChange(ROLES.BUYER)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    !isSeller ? 'bg-white text-[#7A0026] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Collector</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange(ROLES.SELLER)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    isSeller ? 'bg-white text-[#7A0026] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Artisan</span>
                </button>
              </div>

              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7A0026] transition-colors" />
                <input
                  type="text" name="userName" placeholder="Full Name"
                  value={formData.userName} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-bold">+216</div>
                <input
                  type="tel" name="telephone" placeholder="Phone Number"
                  value={formData.telephone} onChange={handleChange}
                  className="w-full pl-16 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium"
                />
              </div>

              {!googleToken && (
                <>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7A0026] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" placeholder="Password"
                      value={formData.password} onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium"
                    />
                    <button 
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7A0026] transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium"
                    />
                    <button 
                      type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}

              {isSeller && (
                <div className="space-y-4 pt-4 mt-2 animate-fade-in">
                  <div className="h-[1px] bg-gray-100 w-full mb-4"></div>
                  <input
                    type="text" name="shopName" placeholder="Store Name"
                    value={formData.shopName} onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium"
                  />
                  <input
                    type="text" name="city" placeholder="City"
                    value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium"
                  />
                  <textarea
                    name="bio" placeholder="Describe your artisanal style..."
                    value={formData.bio} onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A0026]/20 focus:border-[#7A0026] focus:bg-white transition-all text-gray-900 font-medium resize-none"
                  />
                </div>
              )}

              <div className="pt-2 flex items-start space-x-3 px-1">
                <input 
                  type="checkbox" id="terms" checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded-md border-gray-200 text-[#7A0026] focus:ring-[#7A0026]" 
                />
                <label htmlFor="terms" className="text-sm font-medium text-gray-500 leading-tight">
                  I agree to the <Link to="/terms" className="text-[#7A0026] font-bold hover:underline">Terms & Conditions</Link>
                </label>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#7A0026] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#7A0026]/20 hover:bg-[#5a001c] transform active:scale-[0.98] transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Processing...' : (googleToken ? 'Complete Registration' : (isSeller ? 'Create Seller Account' : 'Create Account'))}
              </button>
              
              <button 
                type="button" onClick={() => setStep(1)}
                className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors pt-2"
              >
                Go back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

