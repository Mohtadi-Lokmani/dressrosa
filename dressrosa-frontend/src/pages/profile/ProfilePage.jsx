import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Calendar, Mail, Phone, ShoppingBag, Heart, 
  Star, ChevronRight, Camera, MoreHorizontal, Edit, 
  Package, CheckCircle2, Truck, Settings
} from 'lucide-react';
import { userService } from '../../services/userService';
import { socialService } from '../../services/socialService';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { formatDate, formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuthStore();
  
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState({
    orders: null,
    wishlist: null,
    reviews: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [following, setFollowing] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const fileInputRef = useRef(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const isOwnProfile = !id || parseInt(id) === currentUser?.userId;
  const profilePhotoPath = user?.profileImage || user?.profilePhoto || '';

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      let userData;
      if (isOwnProfile) {
        userData = await userService.getMyProfile();
        setUser(userData);
        updateUser(userData);

        // Fetch dashboard for summary stats (role-based)
        try {
          const dashData = userData?.role === 'SELLER'
            ? await userService.getSellerDashboard()
            : await userService.getBuyerDashboard();
          setDashboard(dashData);
        } catch (e) {
          console.error("Dashboard fetch error:", e);
        }

        // Fetch recent orders
        try {
          const ordersData = await orderService.getMyOrders({ page: 0, size: 3 });
          setRecentOrders(ordersData.content || []);
          setSummaryCounts((prev) => ({
            ...prev,
            orders: ordersData?.totalElements ?? (ordersData?.content?.length || 0)
          }));
        } catch (e) {
          console.error("Orders fetch error:", e);
        }

        // Fetch recent wishlist
        try {
          const wishlistData = await socialService.getMySavedProducts({ page: 0, size: 4 });
          setWishlist(wishlistData.content || []);
          setSummaryCounts((prev) => ({
            ...prev,
            wishlist: wishlistData?.totalElements ?? (wishlistData?.content?.length || 0)
          }));
        } catch (e) {
          console.error("Wishlist fetch error:", e);
        }

        // Fetch activities (composite)
        fetchActivities();

      } else {
        // Public profile view (limited data)
        userData = await userService.getUserById(id);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const [ordersData, reviewsData, savedData] = await Promise.all([
        orderService.getMyOrders({ page: 0, size: 5 }),
        socialService.getMyReviews(),
        socialService.getMySavedProducts({ page: 0, size: 5 })
      ]);

      const oList = (ordersData.content || []).map(o => ({
        id: `o_${o.orderId}`,
        type: 'order',
        title: `You placed an order #${o.orderNumber || o.orderId}`,
        date: new Date(o.createdAt),
        data: o
      }));

      const rList = (reviewsData.content || reviewsData || []).map(r => ({
        id: `r_${r.reviewId}`,
        type: 'review',
        title: `You left a review for ${r.productTitle}`,
        date: new Date(r.createdAt || r.date),
        data: r
      }));

      const sList = (savedData.content || []).map(s => ({
        id: `s_${s.productId}`,
        type: 'wishlist',
        title: `You added ${s.title} to your wishlist`,
        date: new Date(s.createdAt || Date.now() - 86400000), // Fake date if missing
        data: s
      }));

      const combined = [...oList, ...rList, ...sList].sort((a, b) => b.date - a.date).slice(0, 5);
      setActivities(combined);
      setSummaryCounts((prev) => ({
        ...prev,
        reviews: (reviewsData?.content || reviewsData || []).length
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    if (isOwnProfile) {
      socialService.getMyFollowing()
        .then(res => setFollowing((res.content || res || []).slice(0, 3)))
        .catch(e => console.log(e));
    }
  }, [isOwnProfile]);

  useEffect(() => {
    if (activeTab === 'orders' && isOwnProfile) {
      orderService.getMyOrders({ page: 0, size: 20 })
        .then(res => setAllOrders(res.content || []));
    }
  }, [activeTab, isOwnProfile]);

  useEffect(() => {
    if (activeTab === 'likes' && isOwnProfile) {
      socialService.getMyLikes({ page: 0, size: 24 })
        .then((res) => setLikedProducts(res.content || []))
        .catch((e) => console.error('Likes fetch error:', e));
    }
  }, [activeTab, isOwnProfile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await userService.uploadPhoto(file);
      setUser({ ...user, profileImage: res.photoUrl, profilePhoto: res.photoUrl });
      updateUser({ ...currentUser, profileImage: res.photoUrl, profilePhoto: res.photoUrl });
      toast.success('Photo updated successfully');
    } catch(err) { toast.error('Upload failed'); }
    setShowPhotoMenu(false);
  };

  const handlePhotoRemove = async () => {
    try {
      await userService.updateProfile({ ...user, profileImage: null, profilePhoto: null });
      setUser({ ...user, profileImage: null, profilePhoto: null });
      updateUser({ ...currentUser, profileImage: null, profilePhoto: null });
      toast.success('Photo removed');
    } catch(err) { toast.error('Failed to remove photo'); }
    setShowPhotoMenu(false);
  };

  if (loading) return <Loading fullScreen text="Loading profile..." />;
  if (!user) return <div className="text-center py-20">Profile not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'orders', label: 'Orders' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'likes', label: 'Likes' }
  ];

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'SHIPPED': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'CONFIRMED': return 'text-purple-600 bg-purple-50 border-purple-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const resolveProfileImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    return getImageUrl(imagePath);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] py-6 lg:py-8">
      <Container>
        <div className="mx-auto max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start gap-5">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="relative group cursor-pointer" onClick={() => isOwnProfile && setShowPhotoMenu(!showPhotoMenu)}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-md relative">
                    {profilePhotoPath ? (
                      <img src={resolveProfileImageSrc(profilePhotoPath)} alt={user.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl font-black text-gray-300">
                        {user.userName?.charAt(0)}
                      </div>
                    )}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  {isOwnProfile && showPhotoMenu && (
                    <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 w-36 z-50 text-left">
                      <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                      {profilePhotoPath && (
                        <button onClick={(e) => { e.stopPropagation(); handlePhotoRemove(); }} className="w-full text-left px-4 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-gray-50">
                          <span className="w-3.5 h-3.5 text-center flex items-center justify-center">×</span>
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>

                <div className="pt-1">
                  <div className="flex items-center space-x-3 mb-1.5">
                    <h1 className="text-[32px] leading-none font-extrabold text-gray-900 tracking-tight">{user.userName}</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3.5">
                    <span className="text-xs font-semibold text-gray-400">@{user.userName?.toLowerCase().replace(/\s+/g, '_')}</span>
                    <Badge variant="primary" className="text-[10px] py-0.5 px-2.5 bg-burgundy/5 text-burgundy border-burgundy/10 capitalize rounded-full">
                      {user.role?.toLowerCase() || 'Buyer'}
                    </Badge>
                  </div>
                  {user.bio && (
                    <p className="text-sm text-gray-500 font-medium mb-4 max-w-md leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-gray-500">
                    {user.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{user.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" size="sm" icon={Edit} onClick={() => navigate('/profile/edit')} className="text-[11px] rounded-lg h-9 px-4 border-gray-200">
                        Edit Profile
                      </Button>
                      <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" title="Settings">
                        <Settings className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side of header */}
              <div className="w-full md:w-auto grid grid-cols-1 gap-2.5 mt-1 md:mt-0">
                <div className="p-3.5 bg-[#fcfcfd] rounded-xl border border-gray-200 flex items-center gap-3 min-w-[170px]">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400">Member Since</p>
                    <p className="text-[12px] font-bold text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 px-4 md:px-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-6 border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-burgundy text-burgundy'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {tab.id === 'overview' && <ShoppingBag className="w-3 h-3" />}
                    {tab.id === 'activity' && <Calendar className="w-3 h-3" />}
                    {tab.id === 'orders' && <Package className="w-3 h-3" />}
                    {tab.id === 'reviews' && <Star className="w-3 h-3" />}
                    {tab.id === 'likes' && <Heart className="w-3 h-3" />}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
              </div>
            </div>

            {/* Overview Content */}
            {activeTab === 'overview' && isOwnProfile && (
              <div className="space-y-5">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-gray-900 tracking-tight">Recent Orders</h2>
                    <Link to="/orders" className="flex items-center space-x-1 text-[10px] font-black text-burgundy uppercase tracking-widest hover:underline">
                      <span>View All Orders</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  
                  {recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.orderId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#fcfcfd] rounded-xl border border-gray-200 group hover:border-burgundy/30 transition-colors">
                          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm overflow-hidden p-0.5 flex-shrink-0 border border-gray-100">
                              {/* Show first item image if available */}
                              {order.items && order.items[0]?.productImageUrl ? (
                                <img src={getImageUrl(order.items[0].productImageUrl)} alt="Product" className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-gray-900 mb-1 tracking-tight">Order #{order.orderNumber || order.orderId}</h3>
                              <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>{formatDate(order.createdAt)}</span>
                                <span>•</span>
                                <span className={`px-1.5 py-0.5 text-[8px] rounded-full border ${getOrderStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-4 pl-12 sm:pl-0">
                            <div className="text-right">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                              <p className="text-xs font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
                            </div>
                            <button className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-burgundy group-hover:border-burgundy/30 transition-colors" onClick={() => navigate(`/orders/${order.orderId}`)}>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs font-bold text-gray-400">No recent orders.</div>
                  )}
                </div>

                {/* Wishlist */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center space-x-1">
                      <span>Wishlist</span>
                      <span className="text-xs font-bold text-gray-400 not-italic">({wishlist.length})</span>
                    </h2>
                    <Link to="/wishlist" className="flex items-center space-x-1 text-[10px] font-black text-burgundy uppercase tracking-widest hover:underline">
                      <span>View All Wishlist</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {wishlist.map((item) => (
                        <div key={item.productId} className="group cursor-pointer" onClick={() => navigate(`/products/${item.productId}`)}>
                          <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 border border-gray-100">
                            {item.imageUrl || (item.media && item.media[0]?.url) ? (
                              <img src={getImageUrl(item.imageUrl || item.media[0].url)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300">No image</div>
                            )}
                            <button className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm text-burgundy hover:scale-110 transition-transform">
                              <Heart className="w-2.5 h-2.5 fill-burgundy" />
                            </button>
                          </div>
                          <p className="text-[10px] font-black text-gray-900 tracking-tight">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs font-bold text-gray-400">Your wishlist is empty.</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Other Tabs Content */}
            {activeTab === 'activity' && isOwnProfile && (
              <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-black text-gray-900 tracking-tight mb-4">Activity History</h2>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={`full_${activity.id}`} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                          {activity.type === 'order' && <ShoppingBag className="w-4 h-4 text-gray-600" />}
                          {activity.type === 'wishlist' && <Heart className="w-4 h-4 text-gray-600" />}
                          {activity.type === 'review' && <Star className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 tracking-tight">{activity.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {formatDate(activity.date)}
                          </p>
                          {activity.type === 'review' && activity.data.rate && (
                            <div className="flex items-center space-x-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < activity.data.rate ? 'fill-burgundy text-burgundy' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          )}
                          {activity.type === 'review' && activity.data.comment && (
                            <p className="text-xs font-medium text-gray-600 mt-2">{activity.data.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">No activity history.</div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && isOwnProfile && (
              <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-black text-gray-900 tracking-tight mb-4">My Reviews</h2>
                {activities.filter(a => a.type === 'review').length > 0 ? (
                  <div className="space-y-4">
                    {activities.filter(a => a.type === 'review').map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-sm font-black text-gray-900 mb-2">{review.title}</p>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.data.rate ? 'fill-burgundy text-burgundy' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        {review.data.comment && <p className="text-xs text-gray-600">{review.data.comment}</p>}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">
                          {formatDate(review.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">You haven't left any reviews yet.</div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && isOwnProfile && (
              <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-gray-900 tracking-tight">Saved Addresses</h2>
                  <Button variant="outline" size="sm" className="text-[10px] h-8 rounded-lg px-3">Add New Address</Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-black text-gray-900">Default Address</span>
                      <span className="px-1.5 py-0.5 bg-burgundy/10 text-burgundy text-[8px] font-bold uppercase rounded-sm">Primary</span>
                    </div>
                    <p className="text-xs text-gray-600">{user.address || "Tunis, Tunisia"}</p>
                    {user.telephone && <p className="text-xs text-gray-600 mt-1">{user.telephone}</p>}
                  </div>
                  <button className="text-gray-400 hover:text-burgundy transition-colors"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && isOwnProfile && (
              <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-gray-900 tracking-tight">Order History</h2>
                </div>
                {allOrders.length > 0 ? (
                  <div className="space-y-3">
                    {allOrders.map((order) => (
                      <div key={order.orderId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-burgundy/30 transition-colors">
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <div className="w-10 h-10 bg-white rounded-lg shadow-sm overflow-hidden p-0.5 flex-shrink-0 border border-gray-100">
                            {order.items && order.items[0]?.productImageUrl ? (
                              <img src={getImageUrl(order.items[0].productImageUrl)} alt="Product" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-gray-900 mb-1 tracking-tight">Order #{order.orderNumber || order.orderId}</h3>
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span>{formatDate(order.createdAt)}</span>
                              <span>•</span>
                              <span className={`px-1.5 py-0.5 text-[8px] rounded-full border ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4 pl-12 sm:pl-0">
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                            <p className="text-xs font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
                          </div>
                          <button className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-burgundy group-hover:border-burgundy/30 transition-colors" onClick={() => navigate(`/orders/${order.orderId}`)}>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">No orders found.</div>
                )}
              </div>
            )}

            {activeTab === 'likes' && isOwnProfile && (
              <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-gray-900 tracking-tight">Liked Products</h2>
                </div>

                {likedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {likedProducts.map((item) => (
                      <div key={item.productId} className="group cursor-pointer" onClick={() => navigate(`/products/${item.productId}`)}>
                        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 border border-gray-100">
                          {item.imageUrl || (item.media && item.media[0]?.url) ? (
                            <img src={getImageUrl(item.imageUrl || item.media[0].url)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300">No image</div>
                          )}
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm text-burgundy">
                            <Heart className="w-2.5 h-2.5 fill-burgundy" />
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-900 tracking-tight">{formatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">You haven't liked any products yet.</div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          {isOwnProfile && (
            <div className="lg:col-span-4 space-y-5">
              
              {/* Profile Summary */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <h2 className="text-sm font-black text-gray-900 tracking-tight mb-4">Profile Summary</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-[#fcfcfd] rounded-xl border border-gray-200 text-center hover:border-burgundy/20 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                    <div className="w-7 h-7 mx-auto bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm mb-2">
                      <ShoppingBag className="w-3 h-3 text-burgundy" />
                    </div>
                    <p className="text-base font-black text-gray-900 tracking-tight">{summaryCounts.orders ?? dashboard?.totalOrders ?? 0}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">Orders</p>
                  </div>
                  
                  <div className="p-4 bg-[#fcfcfd] rounded-xl border border-gray-200 text-center hover:border-burgundy/20 transition-colors cursor-pointer" onClick={() => navigate('/wishlist')}>
                    <div className="w-7 h-7 mx-auto bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm mb-2">
                      <Heart className="w-3 h-3 text-burgundy" />
                    </div>
                    <p className="text-base font-black text-gray-900 tracking-tight">{summaryCounts.wishlist ?? dashboard?.savedProducts ?? 0}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">Wishlist</p>
                  </div>
                  
                  <div className="p-4 bg-[#fcfcfd] rounded-xl border border-gray-200 text-center hover:border-burgundy/20 transition-colors cursor-pointer">
                    <div className="w-7 h-7 mx-auto bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm mb-2">
                      <Star className="w-3 h-3 text-burgundy" />
                    </div>
                    <p className="text-base font-black text-gray-900 tracking-tight">{summaryCounts.reviews ?? dashboard?.reviewsGiven ?? 0}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">Reviews</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-gray-900 tracking-tight">Recent Activity</h2>
                  <button className="flex items-center space-x-1 text-[10px] font-black text-burgundy uppercase tracking-widest hover:underline">
                    <span>View All Activity</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#fcfcfd] border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {activity.type === 'order' && <ShoppingBag className="w-3 h-3 text-gray-600" />}
                          {activity.type === 'wishlist' && <Heart className="w-3 h-3 text-gray-600" />}
                          {activity.type === 'review' && <Star className="w-3 h-3 text-gray-600" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 tracking-tight mb-0.5">{activity.title}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {formatDate(activity.date)}
                          </p>
                          {activity.type === 'review' && activity.data.rate && (
                            <div className="flex items-center space-x-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2.5 h-2.5 ${i < activity.data.rate ? 'fill-burgundy text-burgundy' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full mt-2 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest" onClick={() => setActiveTab('activity')}>
                      View All Activity
                    </Button>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs font-bold text-gray-400">No recent activity.</div>
                )}
              </div>

              {/* Following */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] mt-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-gray-900 tracking-tight">Following</h2>
                  <Link to="/follow" className="flex items-center space-x-1 text-[10px] font-black text-burgundy uppercase tracking-widest hover:underline">
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                {following.length > 0 ? (
                  <div className="space-y-3">
                    {following.map((seller) => (
                      <div key={seller.userId} className="flex items-center justify-between p-2.5 bg-[#fcfcfd] rounded-xl border border-gray-200 cursor-pointer hover:border-burgundy/30 transition-colors" onClick={() => navigate(`/seller/${seller.userId}`)}>
                        <div className="flex items-center space-x-3">
                          <Avatar src={seller.profilePhoto || seller.profileImage} name={seller.userName} size="sm" />
                          <p className="text-xs font-black text-gray-900">{seller.userName}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Not following anyone</div>
                )}
              </div>

            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;