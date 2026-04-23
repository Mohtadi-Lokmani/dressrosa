import ProductFeedCard from '../product/ProductFeedCard';
import FeedSkeleton from './FeedSkeleton';
import EmptyState from '../common/EmptyState';
import { ShoppingBag } from 'lucide-react';

const FeedContainer = ({ products, loading, hasMore, onLike }) => {
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedSkeleton />
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="No products found"
          description="Be the first to discover amazing products!"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-8">
        {products.map((product) => (
          <ProductFeedCard
            key={product.productId}
            product={product}
            onLike={onLike}
          />
        ))}
      </div>

      {/* Loading More */}
      {loading && products.length > 0 && (
        <div className="py-8">
          <div className="grid grid-cols-1 gap-8">
            <FeedSkeleton count={1} />
          </div>
        </div>
      )}

      {/* End of Feed */}
      {!loading && !hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            You've reached the end! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedContainer;
