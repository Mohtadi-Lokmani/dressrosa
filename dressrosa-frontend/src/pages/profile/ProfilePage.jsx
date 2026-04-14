import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, MapPin, Calendar, Mail, Phone, ShoppingBag, Heart, Users } from 'lucide-react';
import { userService } from '../../services/userService';
import { socialService } from '../../services/socialService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatters';
import ProductFeedCard from '../../components/product/ProductFeedCard';
import toast from 'react-hot-toast';
const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuthStore();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    products: 0,
  });

  const [activeTab, setActiveTab] = useState('likes');
  const [likes, setLikes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const isOwnProfile = !id || parseInt(id) === currentUser?.userId;

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      let data;
      if (isOwnProfile) {
        // Fetch own profile
        data = await userService.getMyProfile();
        setUser(data);
        updateUser(data);
      } else {
        // Fetch other user's profile
        data = await userService.getUserById(id);
        setUser(data);
        
        // Check if following (if seller)
        if (data.role === 'SELLER') {
          const followStatus = await socialService.checkFollow(id);
          setIsFollowing(followStatus);
        }
      }

      // Populate stats from user data
      setStats({
        followers: data.followersCount || 0,
        following: data.followingCount || 0,
        products: data.totalProducts || 0,
      });

      if (isOwnProfile) {
        fetchActivityData();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      setLoadingActivity(true);
      const [likesData, reviewsData, savedData] = await Promise.all([
        socialService.getMyLikes(),
        socialService.getMyReviews(),
        socialService.getMySavedProducts()
      ]);
      setLikes(likesData.content || likesData || []);
      setReviews(reviewsData.content || reviewsData || []);
      setSavedItems(savedData.content || savedData || []);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleFollow = async () => {
    if (!user?.userId) return;

    try {
      if (isFollowing) {
        await socialService.unfollowSeller(user.userId);
        toast.success('Unfollowed');
      } else {
        await socialService.followSeller(user.userId);
        toast.success('Following');
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  if (!user) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <Avatar
              src={user.profileImage}
              name={user.userName}
              size="2xl"
            />

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.userName}</h1>
                {user.role === 'SELLER' && (
                  <Badge variant="primary">Seller</Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {user.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
                {user.telephone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{user.telephone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.followers}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.following}</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="primary"
                      icon={Edit}
                      onClick={() => navigate('/profile/edit')}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      Settings
                    </Button>
                  </>
                ) : (
                  <>
                    {user.role === 'SELLER' && (
                      <Button
                        variant={isFollowing ? 'secondary' : 'primary'}
                        onClick={handleFollow}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/messages?user=${user.userId}`)}
                    >
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        {isOwnProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <button
              onClick={() => navigate('/wishlist')}
              className="bg-white rounded-xl p-6 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Wishlist</h3>
                  <p className="text-sm text-gray-600">Saved products</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(user.role === 'SELLER' ? '/seller/sales' : '/orders')}
              className="bg-white rounded-xl p-6 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.role === 'SELLER' ? 'My Sales' : 'My Orders'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user.role === 'SELLER' ? 'Manage orders' : 'Track purchases'}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/follow')}
              className="bg-white rounded-xl p-6 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Following</h3>
                  <p className="text-sm text-gray-600">Sellers you follow</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Recent Activity or Products */}
        <div className="bg-white rounded-xl p-6">
          {/* Tabs */}
          <div className="flex items-center space-x-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('likes')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'likes'
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Likes ({likes.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Wishlist ({savedItems.length})
            </button>
          </div>

          {loadingActivity ? (
            <div className="py-12 flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : activeTab === 'likes' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {likes.length > 0 ? (
                likes.map((product) => (
                  <ProductFeedCard key={product.productId} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  You haven't liked any products yet.
                </div>
              )}
            </div>
          ) : activeTab === 'saved' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedItems.length > 0 ? (
                savedItems.map((product) => (
                  <ProductFeedCard key={product.productId} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  You haven't saved any products yet.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.reviewId} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-medium text-gray-900">{review.productTitle}</h4>
                         <div className="flex items-center space-x-1 mt-1">
                           {[...Array(5)].map((_, i) => (
                             <span key={i} className={`text-sm ${i < review.rate ? 'text-yellow-400' : 'text-gray-300'}`}>
                               ★
                             </span>
                           ))}
                         </div>
                       </div>
                       <span className="text-sm text-gray-500">{formatDate(review.createdAt || review.date)}</span>
                    </div>
                    {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-500">
                  You haven't written any reviews yet.
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;