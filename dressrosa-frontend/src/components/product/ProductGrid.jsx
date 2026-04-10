import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import Badge from '../common/Badge';

const ProductGrid = ({ products, onLike }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.productId}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        >
          {/* Product Image */}
          <Link to={`/products/${product.productId}`} className="relative block">
            <div className="aspect-square bg-gray-100 overflow-hidden">
              {product.media?.[0]?.url ? (
                <img
                  src={product.media[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-4xl">📸</span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            {product.status === 'SOLD_OUT' && (
              <div className="absolute top-3 left-3">
                <Badge variant="danger">Sold Out</Badge>
              </div>
            )}

            {/* Quick Actions - Show on Hover */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onLike && onLike(product.productId);
                }}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-burgundy hover:text-white transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </Link>

          {/* Product Info */}
          <div className="p-4">
            <Link to={`/products/${product.productId}`}>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-burgundy transition-colors">
                {product.title}
              </h3>
            </Link>

            {/* Seller */}
            <p className="text-sm text-gray-500 mb-2">{product.seller?.userName}</p>

            {/* Price & Rating */}
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-burgundy">
                {formatPrice(product.price)}
              </p>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm text-gray-600">
                    {product.averageRating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;