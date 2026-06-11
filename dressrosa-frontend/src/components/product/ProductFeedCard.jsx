import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, ChevronLeft, ChevronRight, Bookmark, Flag, Sparkles, MessageCircle, Star, Check } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import { socialService } from '../../services/socialService';
import toast from 'react-hot-toast';

const ProductFeedCard = ({ product, onLike, onSave }) =>  {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likesCount || 0);
  const menuRef = useRef(null);

  const images = product.media?.filter(m => m.type === 'IMAGE') || [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [liked, saved] = await Promise.all([
          socialService.checkLike(product.productId),
          socialService.checkSave(product.productId),
        ]);
        setIsLiked(liked);
        setIsSaved(saved);
      } catch (error) {}
    };
    if (product.productId) checkStatus();
  }, [product.productId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = async (e) => {
    if (e) e.preventDefault();
    if (likingInProgress) return;
    setLikingInProgress(true);
    
    try {
      if (isLiked) {
        await socialService.unlikeProduct(product.productId);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await socialService.likeProduct(product.productId);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLikingInProgress(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      if (isSaved) {
        await socialService.unsaveProduct(product.productId);
        setIsSaved(false);
        toast.success('Removed from wishlist');
      } else {
        await socialService.saveProduct(product.productId);
        setIsSaved(true);
        toast.success('Saved to wishlist!');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update wishlist');
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative border border-gray-100 max-w-3xl mx-auto mb-6">
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between bg-white relative z-20">
        <Link to={`/seller/${product.sellerId}`} className="flex items-center space-x-3 group">
          <Avatar src={product.sellerProfilePhoto || product.sellerProfileImage || undefined} name={product.sellerName || 'User'} size="md" />
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="font-bold text-gray-900 text-sm group-hover:text-burgundy transition-colors">
                {product.sellerName || 'User'}
              </p>
              {product.sellerVerified !== false && (
                <div className="w-4 h-4 bg-burgundy rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5">2 hours ago • {product.sellerCity || 'Tunis'}</p>
          </div>
        </Link>
        <div className="flex items-center space-x-2">
          {product.isBoosted && (
            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 fill-red-600" />
              <span>Boosted</span>
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in">
                <button onClick={() => { toast.info('Report coming soon'); setShowMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                  <Flag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Text Content */}
      <div className="px-5 pb-4">
        <Link to={`/products/${product.productId}`} className="block group">
          <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-2">
            {product.title}
          </h3>
          <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
          <p className="font-black text-gray-900 text-[15px] mt-3">{formatPrice(product.price)}</p>
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="px-5 pb-4">
        <Link to={`/products/${product.productId}`} className="block w-full">
          {images.length === 0 ? (
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 border border-gray-100">📸</div>
          ) : images.length === 1 ? (
            <div className="w-full aspect-video sm:aspect-[16/10] bg-gray-50 rounded-xl overflow-hidden group">
              <img src={getImageUrl(images[0].url)} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(0, 3).map((image, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden group">
                  <img src={getImageUrl(image.url)} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {idx === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-black text-lg">+{images.length - 3}</span>
                    </div>
                  )}
                  {idx === 2 && images.length === 3 && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                       <ChevronRight className="w-4 h-4 text-gray-800" />
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Link>
      </div>

      {/* Tags */}
      {(product.categoryName || product.condition || product.brand) && (
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          {product.categoryName && (
            <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-semibold">{product.categoryName}</span>
          )}
          {product.condition && (
            <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-semibold">{product.condition}</span>
          )}
          {product.brand && (
            <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-semibold">{product.brand}</span>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-gray-50">
        <div className="flex items-center space-x-6 text-gray-500">
          <button onClick={handleLike} disabled={likingInProgress} className="flex items-center space-x-2 hover:text-red-500 transition-colors group">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'}`} />
            <span className={`text-[13px] font-medium ${isLiked ? 'text-red-500' : ''}`}>{likeCount}</span>
          </button>
          
          <Link to={`/products/${product.productId}#comments`} className="flex items-center space-x-2 hover:text-gray-900 transition-colors group">
            <MessageCircle className="w-5 h-5 group-hover:text-gray-900" />
            <span className="text-[13px] font-medium">{product.reviewsCount || 0}</span>
          </Link>

          <button className="flex items-center space-x-2 hover:text-gray-900 transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-gray-900">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span className="text-[13px] font-medium">Share</span>
          </button>
        </div>
        
        <button 
          onClick={handleSave} 
          className={`p-2 rounded-full transition-all ${isSaved ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ProductFeedCard;