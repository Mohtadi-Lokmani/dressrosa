import { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { cartService } from '../../services/cartService';
import Container from '../../components/layout/Container';
import ProductGrid from '../../components/product/ProductGrid';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await socialService.getMySavedProducts();
      // Handle potential pagination response
      setProducts(data.content || data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await socialService.unsaveProduct(productId);
      setProducts(prev => prev.filter(p => p.productId !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      // Note: This is simplified - you'll need to handle variant selection
      toast.info('Please select variant from product page');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading wishlist..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Wishlist */}
        {products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love to buy them later!"
            actionLabel="Start Shopping"
            onAction={() => window.location.href = '/shop'}
          />
        ) : (
          <ProductGrid
            products={products}
            onLike={handleRemoveFromWishlist}
          />
        )}
      </Container>
    </div>
  );
};

export default WishlistPage;