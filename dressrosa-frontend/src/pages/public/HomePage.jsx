import { useState } from 'react';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import FeedContainer from '../../components/feed/FeedContainer';
import Container from '../../components/layout/Container';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [filters] = useState({
    status: 'IN_STOCK',
    sort: 'createdAt,desc',
  });

  // Fetch function for infinite scroll
  const fetchProducts = async ({ page, size }) => {
    return await productService.getAll({
      page,
      size,
      status: filters.status,
      sort: filters.sort,
    });
  };

  const { data: products, loading, hasMore } = useInfiniteScroll(fetchProducts, {
    pageSize: 20,
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Home Feed</h1>
          <p className="text-gray-600 text-sm mt-1">
            Discover amazing products from our community
          </p>
        </div>

        {/* Feed */}
        <FeedContainer
          products={products}
          loading={loading}
          hasMore={hasMore}
          onLike={handleLike}
        />
      </Container>
    </div>
  );
};

export default HomePage;