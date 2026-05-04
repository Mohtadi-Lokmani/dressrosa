import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, ChevronLeft, ChevronRight, Bookmark, Flag, Sparkles, MessageCircle, Star } from 'lucide-react';
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
  const [likeCount, setLikeCount] = useState(product.likeCount || 0);
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
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative border border-gray-100 max-w-2xl mx-auto">
      {/* Seller Header */}
      <div className="p-4 bg-white flex items-center justify-between border-b border-gray-50">
        <Link to={`/seller/${product.sellerId}`} className="flex items-center space-x-3 group">
          <Avatar src={product.sellerProfileImage || undefined} name={product.sellerName || 'User'} size="sm" />
          <div>
            <p className="font-black text-gray-900 text-[13px] group-hover:text-burgundy transition-colors uppercase tracking-wider">
              {product.sellerName || 'User'}
            </p>
            <p className="text-[11px] text-gray-400 font-bold italic">Fashion Seller • 2h ago</p>
          </div>
        </Link>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in">
              <button onClick={() => { toast.info('Report coming soon'); setShowMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                <Flag className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Image Carousel */}
      <div className="relative aspect-video lg:aspect-[2/1] bg-gray-50 overflow-hidden group">
        <Link to={`/products/${product.productId}`} className="block w-full h-full">
          {images.length > 0 ? (
            <img src={getImageUrl(images[currentImageIndex]?.url)} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">📸</div>
          )}
        </Link>
        
        {hasMultipleImages && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"><ChevronLeft className="w-5 h-5 text-gray-800" /></button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"><ChevronRight className="w-5 h-5 text-gray-800" /></button>
          </>
        )}

        {product.isBoosted && (
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-gray-900/80 text-white px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
          </div>
        )}
      </div>

      {/* Interactions Area */}
      <div className="p-4 space-y-4">
        {/* Like Count - Simplified as requested */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            <span className="text-[13px] font-black text-gray-700 tracking-tight">{likeCount} likes</span>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-50"></div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLike}
            disabled={likingInProgress}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all ${
              isLiked ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          <button 
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all ${
              isSaved ? 'bg-burgundy/5 text-burgundy shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          
          <Link 
            to={`/products/${product.productId}`}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md shadow-gray-200"
          >
            Details
          </Link>
        </div>

        {/* Product Info */}
        <div className="pt-2">
          <Link to={`/products/${product.productId}`} className="block group">
            <h3 className="font-black text-gray-900 text-lg group-hover:text-burgundy transition-colors leading-tight mb-1">
              {product.title}
            </h3>
            <p className="text-[13px] text-gray-500 font-semibold line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </Link>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-black text-burgundy tracking-tighter">{formatPrice(product.price)}</span>
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-[11px] font-black text-yellow-700">New</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFeedCard;