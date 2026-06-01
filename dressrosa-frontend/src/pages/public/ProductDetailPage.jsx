import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, MessageCircle, ShoppingCart, Plus, Minus, 
  CheckCircle2, Truck, RefreshCcw, ShieldCheck, Star, 
  AlertCircle, Bookmark
} from 'lucide-react';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { cartService } from '../../services/cartService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import RatingBreakdown from '../../components/social/RatingBreakdown';
import ReviewForm from '../../components/social/ReviewForm';
import ReviewList from '../../components/social/ReviewList';
import ProductGrid from '../../components/product/ProductGrid';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    // Scroll to top when ID changes
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getById(id);
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      checkSocialStatus();
      fetchReviews();
      fetchRelatedProducts(data.categoryId, data.productId);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    if (!categoryId) return;
    try {
      const data = await productService.getAll({ categoryId, size: 5 });
      // Filter out the current product
      const filtered = (data.content || []).filter(p => p.productId !== currentProductId);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const checkSocialStatus = async () => {
    if (!user) return;
    try {
      const [likeStatus, saveStatus] = await Promise.all([
        socialService.checkLike(id).catch(() => false),
        socialService.checkSave(id).catch(() => false)
      ]);
      setIsLiked(likeStatus);
      setIsSaved(saveStatus);
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
    if (!user) {
      toast.error('Please login to like products');
      return;
    }
    try {
      if (isLiked) {
        await socialService.unlikeProduct(id);
      } else {
        await socialService.likeProduct(id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save products');
      return;
    }
    try {
      if (isSaved) {
        await socialService.unsaveProduct(id);
        toast.success('Removed from wishlist');
      } else {
        await socialService.saveProduct(id);
        toast.success('Saved to wishlist');
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleMessage = () => {
    if (!user) {
      toast.error('Please login to message sellers');
      return;
    }
    if (product?.sellerId) {
      navigate(`/messages?user=${product.sellerId}`);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    try {
      setAddingToCart(true);
      await cartService.addToCart(product.productId, selectedVariant.variantId, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      await socialService.addReview(product.productId, reviewData.rate, reviewData.comment);
      await fetchReviews();
      toast.success('Review submitted successfully!');
    } catch (error) {
      throw error;
    } finally {
      setSubmittingReview(false);
    }
  };

  const increaseQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) return <Loading fullScreen text="Loading product..." />;
  if (!product) return null;

  const images = product.media?.filter(m => m.type === 'IMAGE') || [];
  const currentImage = getImageUrl(images[selectedImage]?.url) || 'https://via.placeholder.com/600';
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length : 0;
  const reviewCount = reviews.length;

  const sizes = [...new Set(product.variants?.filter(v => v.size).map(v => v.size) || [])];
  const colors = [...new Set(product.variants?.filter(v => v.color).map(v => v.color) || [])];

  const isNew = () => {
    if (!product.createdAt) return false;
    const date = new Date(product.createdAt);
    const now = new Date();
    return Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24)) <= 7;
  };

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/home" className="hover:text-burgundy">Home</Link>
          <span className="opacity-30">/</span>
          <Link to="/shop" className="hover:text-burgundy">Shop</Link>
          <span className="opacity-30">/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-widest text-gray-900 mb-8 transition-all hover:translate-x-[-2px]"
        >
          <ChevronLeft className="w-4 h-4 text-burgundy" />
          <span>Back to Shop</span>
        </button>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Gallery Section */}
          <div>
            <div className="relative aspect-square bg-gray-50 rounded-[24px] overflow-hidden mb-4 border border-gray-100 shadow-sm">
              <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                {isNew() && (
                  <div className="bg-burgundy text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-lg">
                    New
                  </div>
                )}
              </div>
              <button
                onClick={handleLike}
                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-burgundy text-burgundy' : 'text-gray-400'}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-burgundy' : 'border-transparent'
                    }`}
                  >
                    <img src={getImageUrl(image.url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3 italic">{product.title}</h1>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{averageRating.toFixed(1)} ({reviewCount})</span>
              </div>

              <div className="flex items-center space-x-4">
                <p className="text-3xl font-black text-burgundy tracking-tight">
                  {formatPrice(product.price)}
                </p>
                {product.status === 'IN_STOCK' && (
                  <div className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">
                    In Stock
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Sold by <Link to={`/seller/${product.sellerId}`} className="text-gray-900 hover:text-burgundy">{product.sellerName}</Link>
                {product.sellerVerified && <CheckCircle2 className="w-3 h-3 text-burgundy inline ml-1 fill-burgundy/5" />}
              </p>
            </div>

            {/* Size & Color Selectors */}
            <div className="space-y-6">
              {sizes.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedVariant(product.variants.find(v => v.size === size))}
                        className={`px-4 py-2 text-[11px] font-black rounded-lg border-2 transition-all ${
                          selectedVariant?.size === size ? 'border-burgundy bg-burgundy text-white shadow-md shadow-burgundy/10' : 'border-gray-50 text-gray-400 hover:border-burgundy/30'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Color</label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedVariant(product.variants.find(v => v.color === color))}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                          selectedVariant?.color === color ? 'border-burgundy bg-burgundy/5 text-burgundy' : 'border-gray-50 text-gray-500 hover:border-burgundy/30'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: color.toLowerCase() }} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Warning */}
              {selectedVariant && selectedVariant.quantity < 10 && selectedVariant.quantity > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-burgundy/5 rounded-xl border border-burgundy/10">
                  <AlertCircle className="w-4 h-4 text-burgundy" />
                  <p className="text-[10px] font-bold text-burgundy uppercase tracking-widest">
                    Hurry! Only {selectedVariant.quantity} left.
                  </p>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
                <button onClick={decreaseQuantity} className="p-2 text-gray-400 hover:text-burgundy transition-colors"><Minus className="w-3 h-3" /></button>
                <span className="text-[14px] font-black w-8 text-center text-gray-900">{quantity}</span>
                <button onClick={increaseQuantity} className="p-2 text-gray-400 hover:text-burgundy transition-colors"><Plus className="w-3 h-3" /></button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="md"
                  className="h-[48px] px-8 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-burgundy/10"
                  icon={ShoppingCart}
                  loading={addingToCart}
                  disabled={!selectedVariant || product.status === 'SOLD_OUT' || selectedVariant.quantity === 0}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                
                <button 
                  onClick={handleLike}
                  title="Like"
                  className={`w-12 h-[48px] rounded-xl border border-gray-100 flex items-center justify-center transition-all active:scale-95 ${isLiked ? 'bg-burgundy/5 text-burgundy' : 'text-gray-400 hover:border-burgundy'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-burgundy' : ''}`} />
                </button>

                <button 
                  onClick={handleSave}
                  title="Save"
                  className={`w-12 h-[48px] rounded-xl border border-gray-100 flex items-center justify-center transition-all active:scale-95 ${isSaved ? 'bg-burgundy/5 text-burgundy' : 'text-gray-400 hover:border-burgundy'}`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-burgundy' : ''}`} />
                </button>

                <button 
                  onClick={handleMessage}
                  title="Message Seller"
                  className="w-12 h-[48px] rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:border-burgundy transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>


          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* Description Section */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {product.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</span>
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{product.categoryName}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Posted by</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">
                      <Link to={`/seller/${product.sellerId}`} className="hover:text-burgundy transition-colors">{product.sellerName}</Link>
                    </span>
                    {product.sellerVerified && <CheckCircle2 className="w-3 h-3 text-burgundy fill-burgundy/5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings Summary Section */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-50">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 italic text-center">Reviews Summary</h3>
                <div className="text-center mb-8">
                  <p className="text-5xl font-black text-gray-900 tracking-tight italic">{averageRating.toFixed(1)}</p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-100'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Based on {reviewCount} reviews</p>
                </div>
                <RatingBreakdown reviews={reviews} />
              </div>
            </div>
          </div>

          {/* Full Reviews Section */}
          <div className="mt-20 space-y-12 pb-20 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic">Customer Reviews</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4">
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 sticky top-24">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 italic">Share your experience</h3>
                  <ReviewForm
                    productId={product.productId}
                    onSubmit={handleSubmitReview}
                    loading={submittingReview}
                  />
                </div>
              </div>

              <div className="lg:col-span-8">
                <ReviewList
                  reviews={reviews}
                  currentUserId={user?.userId}
                />
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic">Related Products</h2>
                <Link to={`/shop?categoryId=${product.categoryId}`} className="text-[10px] font-black uppercase tracking-widest text-burgundy hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ProductGrid 
                  products={relatedProducts} 
                  onLike={(productId) => navigate(`/products/${productId}`)} 
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailPage;