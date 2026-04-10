import { useState } from 'react';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import FeedContainer from '../../components/feed/FeedContainer';
import Container from '../../components/layout/Container';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

const FollowingPage = () => {
  const navigate = useNavigate();

  // Fetch products from followed sellers
  const fetchFollowingProducts = async ({ page, size }) => {
    // This will need a backend endpoint that filters by followed sellers
    // For now, using regular products endpoint
    // TODO: Create backend endpoint: GET /api/products/following
    return await productService.getAll({
      page,
      size,
      status: 'IN_STOCK',
      sort: 'createdAt,desc',
    });
  };

  const { data: products, loading, hasMore } = useInfiniteScroll(
    fetchFollowingProducts,
    { pageSize: 20 }
  );

  const handleLike = async (productId) => {
    try {
      await socialService.likeProduct(productId);
      toast.success('Product liked!');
    } catch (error) {
      console.error('Error liking product:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Following</h1>
          <p className="text-gray-600 text-sm mt-1">
            Products from sellers you follow
          </p>
        </div>

        {/* Feed */}
        {!loading && products.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No products from followed sellers"
            description="Start following sellers to see their products here!"
            actionLabel="Explore Products"
            onAction={() => navigate('/')}
          />
        ) : (
          <FeedContainer
            products={products}
            loading={loading}
            hasMore={hasMore}
            onLike={handleLike}
          />
        )}
      </Container>
    </div>
  );
};

export default FollowingPage;