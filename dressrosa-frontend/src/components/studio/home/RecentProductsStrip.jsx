import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Edit3, Plus, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';
import { getImageUrl } from '../../../utils/helpers';
import { formatPrice } from '../../../utils/formatters';

/**
 * RecentProductsStrip
 * A horizontal scrollable row of the seller's latest products.
 * Shows minimal stats per card (views, orders) with an Edit shortcut.
 */
const RecentProductsStrip = ({ products, loading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 text-base">Recent Products</h3>
        <Link
          to={ROUTES.STUDIO_PRODUCTS}
          className="inline-flex items-center space-x-1 text-xs font-bold text-burgundy hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex space-x-4 px-6 py-5 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-44 h-52 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="flex space-x-4 px-6 py-5 overflow-x-auto scrollbar-hide">
          {products.map((product) => {
            const coverImage = product.media?.[0]?.url
              ? getImageUrl(product.media[0].url)
              : null;

            return (
              <div
                key={product.productId}
                className="flex-shrink-0 w-44 group"
              >
                {/* Thumbnail */}
                <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Edit overlay */}
                  <Link
                    to={`/studio/products/${product.productId}/edit`}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]"
                  >
                    <div className="flex items-center space-x-1.5 bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </div>
                  </Link>

                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      product.status === 'IN_STOCK'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {product.status === 'IN_STOCK' ? 'Live' : 'Sold Out'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <h4 className="text-xs font-bold text-gray-900 truncate leading-tight mb-1">
                  {product.title}
                </h4>
                <p className="text-sm font-black text-burgundy mb-2">
                  {formatPrice(product.price)}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Eye className="w-3 h-3" />
                    <span className="text-[10px] font-semibold">{product.viewCount ?? 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ShoppingBag className="w-3 h-3" />
                    <span className="text-[10px] font-semibold">{product.orderCount ?? 0}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Product card */}
          <Link
            to={ROUTES.STUDIO_PRODUCTS_ADD}
            className="flex-shrink-0 w-44 h-44 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-burgundy/40 hover:bg-burgundy/5 transition-all group"
          >
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-burgundy/10 rounded-xl flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-burgundy transition-colors" />
            </div>
            <p className="text-xs font-bold text-gray-400 group-hover:text-burgundy transition-colors">
              Add Product
            </p>
          </Link>
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500 mb-1">No products yet</p>
          <Link
            to={ROUTES.STUDIO_PRODUCTS_ADD}
            className="inline-flex items-center space-x-2 text-sm font-bold text-burgundy hover:underline"
          >
            <Plus className="w-4 h-4" />
            <span>Add your first product</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentProductsStrip;
