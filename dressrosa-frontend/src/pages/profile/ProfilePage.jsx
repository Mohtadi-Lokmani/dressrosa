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

  const isOwnProfile = !id || parseInt(id) === currentUser?.userId;

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      if (isOwnProfile) {
        // Fetch own profile
        const data = await userService.getMyProfile();
        setUser(data);
        updateUser(data);
      } else {
        // Fetch other user's profile
        const data = await userService.getUserById(id);
        setUser(data);
        
        // Check if following (if seller)
        if (data.role === 'SELLER') {
          const followStatus = await socialService.checkFollow(id);
          setIsFollowing(followStatus.isFollowing);
        }
      }

      // Fetch stats (mock for now, you can add backend endpoints)
      setStats({
        followers: 0,
        following: 0,
        products: 0,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
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
              onClick={() => navigate('/orders')}
              className="bg-white rounded-xl p-6 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Orders</h3>
                  <p className="text-sm text-gray-600">Track purchases</p>
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

        {/* Recent Activity or Products (if seller) */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {user.role === 'SELLER' ? 'Products' : 'Activity'}
          </h2>
          <p className="text-gray-500 text-center py-12">
            Coming soon...
          </p>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;