import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import Badge from '../common/Badge';

const ProductGrid = ({ products, onLike, onAddToCart, viewType = 'grid' }) => {
  const isNew = (createdAt) => {
    if (!createdAt) return false;
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <>
      {products.map((product) => (
        <div
          key={product.productId}
          className={`group bg-white rounded-[16px] overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-gray-100 flex ${
            viewType === 'list' ? 'flex-row h-40 mb-6 w-full' : 'flex-col'
          }`}
        >
          {/* Image Section */}
          <div className={`relative overflow-hidden bg-gray-50 ${
            viewType === 'list' ? 'w-40 h-full' : 'aspect-[1/1]'
          }`}>
            <Link to={`/products/${product.productId}`} className="block w-full h-full">
              {product.media?.[0]?.url ? (
                <img
                  src={getImageUrl(product.media[0].url)}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[10px]">No image</div>
              )}
            </Link>

            {/* Badges */}
            <div className="absolute top-2 left-2">
              {isNew(product.createdAt) && (
                <div className="bg-burgundy text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                  New
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={(e) => { e.preventDefault(); onLike?.(product.productId); }}
              className={`absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all active:scale-90 ${
                product.isLiked ? 'text-burgundy' : 'text-gray-400 hover:text-burgundy'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${product.isLiked ? 'fill-burgundy' : ''}`} />
            </button>
          </div>

          {/* Info Section */}
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div className="mb-2">
              <Link to={`/products/${product.productId}`}>
                <h3 className="font-bold text-gray-900 text-[12px] tracking-tight line-clamp-1 mb-1 group-hover:text-burgundy transition-colors">
                  {product.title}
                </h3>
              </Link>
              <div className="flex items-center space-x-1 opacity-60">
                <span className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-widest">
                  Atelier {product.sellerName || 'Minimal'}
                </span>
                {product.sellerVerified && (
                  <CheckCircle2 className="w-2.5 h-2.5 text-burgundy fill-burgundy/5" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-burgundy tracking-tight">
                {formatPrice(product.price)}
              </span>
              <button 
                onClick={() => onAddToCart?.(product)}
                className="w-7 h-7 bg-[#FDF4F6] text-burgundy rounded-full flex items-center justify-center hover:bg-burgundy hover:text-white transition-all active:scale-90"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductGrid;