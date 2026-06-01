import { useState } from 'react';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import FeedContainer from '../../components/feed/FeedContainer';
import Container from '../../components/layout/Container';
import toast from 'react-hot-toast';
import { Star, Users, Zap, Clock, Filter } from 'lucide-react';

import HomeAside from '../../components/feed/HomeAside';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('for-you');
  const [filters] = useState({
    status: 'IN_STOCK',
    sort: 'createdAt,desc',
  });

  // Fetch function for infinite scroll
  const fetchProducts = async ({ page, size }) => {
    return await productService.getFeed({
      page,
      size,
      filter: activeTab,
    });
  };

  const { data: products, loading, hasMore } = useInfiniteScroll(fetchProducts, {
    pageSize: 20,
    dependencies: [activeTab], // Reset when tab changes
  });

  const handleLike = async (productId) => {
    try {
      await socialService.likeProduct(productId);
      toast.success('Product liked!');
    } catch (error) {
      console.error('Error liking product:', error);
    }
  };

  const tabs = [
    { id: 'for-you', label: 'For You', icon: Star },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'popular', label: 'Popular', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Container className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Tabs - Directly at the top as requested */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-[#FDF4F6] text-burgundy shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'fill-burgundy' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100/50 hover:bg-gray-50 transition-colors group">
                <Filter className="w-5 h-5 text-gray-400 group-hover:text-burgundy transition-colors" />
              </button>
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