import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatPrice } from '../../utils/formatters';

const ProductFeedCard = ({ product, onLike, onSave }) =>  {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(product.isLiked || false);

  const images = product.media?.filter(m => m.type === 'IMAGE') || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    if (onLike) {
      await onLike(product.productId);
    }
  };

  // Calculate average rating
  const averageRating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header - Seller Info */}
      <div className="flex items-center justify-between p-4">
        <Link
          to={`/seller/${product.seller?.userId}`}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={product.seller?.profileImage}
            name={product.seller?.userName}
            size="md"
          />
          <div>
            <p className="font-semibold text-gray-900">{product.seller?.userName}</p>
            <p className="text-xs text-gray-500">
              {product.category?.name || 'Fashion'}
            </p>
          </div>
        </Link>

        {/* Menu Button */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Product Images Carousel */}
      <Link to={`/products/${product.productId}`} className="relative block group">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]?.url || 'https://via.placeholder.com/400'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-4xl">📸</span>
            </div>
          )}
        </div>

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Status Badge */}
        {product.status === 'SOLD_OUT' && (
          <div className="absolute top-3 left-3">
            <Badge variant="danger">Sold Out</Badge>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Title & Price */}
        <Link to={`/products/${product.productId}`} className="block mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
            {product.title}
          </h3>
          <p className="text-lg font-bold text-burgundy">
            {formatPrice(product.price)}
          </p>
        </Link>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < Math.floor(averageRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
            <span className="text-sm text-gray-600 ml-1">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            to={`/products/${product.productId}`}
            className="text-sm font-medium text-burgundy hover:text-burgundy-dark transition-colors"
          >
            View More
          </Link>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 group-hover:text-red-500'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFeedCard;