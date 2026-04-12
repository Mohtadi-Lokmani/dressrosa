import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, ShoppingBag, Shield, CheckCircle } from 'lucide-react';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import ProductFeedCard from '../../components/product/ProductFeedCard';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const SellerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchSellerInfo();
  }, [id]);

  const fetchSellerInfo = async () => {
    try {
      setLoading(true);
      const data = await userService.getSellerProfile(id);
      setSeller(data);

      if (currentUser) {
        const followStatus = await socialService.checkFollow(id);
        setIsFollowing(followStatus.isFollowing);
      }

      fetchSellerProducts();
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      toast.error('Seller not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    try {
      setLoadingProducts(true);
      const result = await productService.getBySeller(id);
      setProducts(result.content || result || []);
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please log in to follow sellers');
      return;
    }

    try {
      if (isFollowing) {
        await socialService.unfollowSeller(id);
        toast.success('Unfollowed');
      } else {
        await socialService.followSeller(id);
        toast.success('Following');
      }
      setIsFollowing(!isFollowing);
      // Optimistically update followers count
      setSeller(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading seller profile..." />;
  }

  if (!seller) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar src={seller.profilePhoto} name={seller.userName} size="2xl" />

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{seller.userName}</h1>
                {seller.verificationBadge && (
                  <Badge variant="success" icon={CheckCircle}>Verified Seller</Badge>
                )}
              </div>

              {seller.bio && (
                <p className="text-gray-600 mb-4">{seller.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(seller.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{seller.totalProducts || 0}</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{seller.followersCount || 0}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl font-bold text-gray-900">{seller.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {currentUser?.userId !== seller.userId && (
                  <>
                    <Button 
                      variant={isFollowing ? 'secondary' : 'primary'} 
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/messages?user=${seller.userId}`)}
                    >
                      Message Seller
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seller's Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <ShoppingBag className="w-6 h-6 text-burgundy" />
            <h2 className="text-xl font-semibold text-gray-900">Seller's Products</h2>
          </div>

          {loadingProducts ? (
            <div className="py-12 flex justify-center"><div className="spinner"></div></div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductFeedCard key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>This seller hasn't posted any products yet.</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SellerProfilePage;
