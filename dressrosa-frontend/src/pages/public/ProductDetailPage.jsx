import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Heart, Share2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { cartService } from '../../services/cartService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import RatingBreakdown from '../../components/social/RatingBreakdown';
import ReviewForm from '../../components/social/ReviewForm';
import ReviewList from '../../components/social/ReviewList';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch product details
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getById(id);
      setProduct(data);
      
      // Set first variant as default
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      
      // Check if liked/saved/following
      checkSocialStatus();
      
      // Fetch reviews
      fetchReviews();
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const checkSocialStatus = async () => {
    try {
      const [likeStatus, saveStatus, followStatus] = await Promise.all([
        socialService.checkLike(id).catch(() => ({ isLiked: false })),
        socialService.checkSave(id).catch(() => ({ isSaved: false })),
        product?.seller?.userId
          ? socialService.checkFollow(product.seller.userId).catch(() => ({ isFollowing: false }))
          : Promise.resolve({ isFollowing: false }),
      ]);
      setIsLiked(likeStatus.isLiked);
      setIsSaved(saveStatus.isSaved);
      setIsFollowing(followStatus.isFollowing);
    } catch (error) {
      console.error('Error checking social status:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await socialService.getProductReviews(id, { page: 0, size: 100 });
      setReviews(data.content || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await socialService.unlikeProduct(id);
        toast.success('Removed from likes');
      } else {
        await socialService.likeProduct(id);
        toast.success('Added to likes');
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await socialService.unsaveProduct(id);
        toast.success('Removed from wishlist');
      } else {
        await socialService.saveProduct(id);
        toast.success('Added to wishlist');
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleFollow = async () => {
    if (!product?.seller?.userId) return;

    try {
      if (isFollowing) {
        await socialService.unfollowSeller(product.seller.userId);
        toast.success('Unfollowed seller');
      } else {
        await socialService.followSeller(product.seller.userId);
        toast.success('Following seller');
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.productId, selectedVariant.variantId, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      await socialService.addReview(product.productId, reviewData.rate, reviewData.comment);
      await fetchReviews(); // Refresh reviews
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      throw error;
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await socialService.deleteReview(reviewId);
      await fetchReviews(); // Refresh reviews
      toast.success('Review deleted');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const increaseQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading product..." />;
  }

  if (!product) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Button onClick={() => navigate('/home')}>Back to Home</Button>
        </div>
      </Container>
    );
  }

  const images = product.media?.filter(m => m.type === 'IMAGE') || [];
  const currentImage = images[selectedImage]?.url || 'https://via.placeholder.com/600';

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;

  // Group variants by unique combinations
  const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const colors = [...new Set(product.variants?.map(v => v.color) || [])];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/home" className="hover:text-burgundy">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-burgundy">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-xl overflow-hidden mb-4 aspect-square">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-burgundy'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div>
            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              {/* Rating */}
              {reviewCount > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <p className="text-4xl font-bold text-burgundy">
                  {formatPrice(product.price)}
                </p>
                <Badge variant={product.status === 'IN_STOCK' ? 'success' : 'danger'}>
                  {product.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                </Badge>
              </div>
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const variant = product.variants.find(v => v.size === size);
                        const isSelected = selectedVariant?.size === size;
                        const isAvailable = variant && variant.quantity > 0;

                        return (
                          <button
                            key={size}
                            onClick={() => isAvailable && setSelectedVariant(variant)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                              isSelected
                                ? 'border-burgundy bg-burgundy text-white'
                                : isAvailable
                                ? 'border-gray-300 hover:border-burgundy'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const variant = product.variants.find(v => v.color === color);
                        const isSelected = selectedVariant?.color === color;
                        const isAvailable = variant && variant.quantity > 0;

                        return (
                          <button
                            key={color}
                            onClick={() => isAvailable && setSelectedVariant(variant)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                              isSelected
                                ? 'border-burgundy bg-burgundy text-white'
                                : isAvailable
                                ? 'border-gray-300 hover:border-burgundy'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Info */}
                {selectedVariant && (
                  <p className="text-sm text-gray-600">
                    {selectedVariant.quantity} items available
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={!selectedVariant || quantity >= selectedVariant.quantity}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 mb-6">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={ShoppingCart}
                loading={addingToCart}
                disabled={!selectedVariant || product.status === 'SOLD_OUT'}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>

              <button
                onClick={handleLike}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-burgundy transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`}
                />
              </button>

              <button
                onClick={handleSave}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-burgundy transition-colors"
              >
                <Share2
                  className={`w-5 h-5 ${
                    isSaved ? 'fill-burgundy text-burgundy' : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <Link
                  to={`/seller/${product.seller?.userId}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={product.seller?.profileImage}
                    name={product.seller?.userName}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{product.seller?.userName}</p>
                    <p className="text-sm text-gray-500">View Profile</p>
                  </div>
                </Link>

                <Button
                  variant={isFollowing ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Rating Breakdown */}
            <div>
              <RatingBreakdown reviews={reviews} />
            </div>

            {/* Review Form */}
            <div className="lg:col-span-2">
              <ReviewForm
                productId={product.productId}
                onSubmit={handleSubmitReview}
                loading={submittingReview}
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="mt-8">
            <ReviewList
              reviews={reviews}
              onDeleteReview={handleDeleteReview}
              currentUserId={user?.userId}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailPage;