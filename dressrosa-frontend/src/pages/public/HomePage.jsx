import { useState } from 'react';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import FeedContainer from '../../components/feed/FeedContainer';
import Container from '../../components/layout/Container';
import toast from 'react-hot-toast';

import HomeAside from '../../components/feed/HomeAside';

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
    <div className="min-h-screen bg-[#F0F2F5]">
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Feed Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Home Feed</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                Discover the latest masterpieces from your favorite ateliers
              </p>
            </div>

            <FeedContainer
              products={products}
              loading={loading}
              hasMore={hasMore}
              onLike={handleLike}
            />
          </div>

          {/* Right Sidebar - Sticky on scroll */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <HomeAside />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;