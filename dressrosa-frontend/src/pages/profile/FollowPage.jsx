import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store } from 'lucide-react';
import { socialService } from '../../services/socialService';
import Container from '../../components/layout/Container';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const FollowPage = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const data = await socialService.getMyFollowing();
      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to load following list');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (sellerId) => {
    try {
      await socialService.unfollowSeller(sellerId);
      setFollowing(prev => prev.filter(seller => seller.userId !== sellerId));
      toast.success('Unfollowed seller');
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error('Failed to unfollow');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading following..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
          <p className="text-gray-600">
            {following.length} {following.length === 1 ? 'seller' : 'sellers'}
          </p>
        </div>

        {/* Following List */}
        {following.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Not following anyone yet"
            description="Follow sellers to see their latest products in your feed!"
            actionLabel="Explore Sellers"
            onAction={() => window.location.href = '/shop'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {following.map((seller) => (
              <div
                key={seller.userId}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={seller.profileImage}
                    name={seller.userName}
                    size="xl"
                    className="mb-4"
                  />
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {seller.userName}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {seller.productsCount || 0} products
                  </p>

                  <div className="flex items-center space-x-2 w-full">
                    <Link
                      to={`/seller/${seller.userId}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" fullWidth icon={Store}>
                        View Shop
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUnfollow(seller.userId)}
                    >
                      Unfollow
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default FollowPage;