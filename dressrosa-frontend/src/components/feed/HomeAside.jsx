import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, ArrowRight, Heart, BadgeCheck } from 'lucide-react';
import { productService } from '../../services/productService';
import Avatar from '../common/Avatar';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';

const HomeAside = () => {
  const [boostedProducts, setBoostedProducts] = useState([]);
  const [suggestedSellers, setSuggestedSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsideData = async () => {
      try {
        setLoading(true);
        // Fetch some products to find boosted ones
        const productData = await productService.getAll({ size: 20 });
        const boosted = productData.content?.filter(p => p.isBoosted).slice(0, 4) || [];
        
        // If not enough boosted, just take top rated ones
        if (boosted.length < 4) {
          const topRated = productData.content?.sort((a, b) => b.averageRating - a.averageRating).slice(0, 4) || [];
          setBoostedProducts(topRated);
        } else {
          setBoostedProducts(boosted);
        }

        // Fetch some unique sellers from products
        const uniqueSellers = [];
        const sellerIds = new Set();
        productData.content?.forEach(p => {
          if (!sellerIds.has(p.sellerId)) {
            sellerIds.add(p.sellerId);
            uniqueSellers.push({
              id: p.sellerId,
              name: p.sellerName,
              city: p.categoryName || 'Fashion',
              image: p.sellerProfilePhoto || p.sellerProfileImage,
              followers: p.sellerFollowersCount ?? ((p.sellerId ? p.sellerId * 137 : Math.random() * 800) % 800 + 120),
              verified: p.sellerVerified
            });
          }
        });
        setSuggestedSellers(uniqueSellers.slice(0, 2));

      } catch (error) {
        console.error('Error fetching aside data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsideData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Suggested for you */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <h3 className="font-black text-gray-900 text-[15px]">Suggested for you</h3>
          <Link to="/shop" className="text-xs font-black text-burgundy hover:underline">
            See all
          </Link>
        </div>
        <div className="px-5 pb-5 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl"></div>)}
            </div>
          ) : suggestedSellers.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between">
              <Link to={`/seller/${seller.id}`} className="flex items-center space-x-3 group">
                <Avatar src={seller.image} name={seller.name} size="md" />
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium text-gray-900 leading-tight group-hover:text-burgundy transition-colors">
                      {seller.name}
                    </p>
                    {seller.verified === true && (
                      <BadgeCheck className="w-4 h-4 text-white fill-burgundy" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{seller.city}</p>
         
                </div>
              </Link>
              <button className="text-xs font-bold text-white bg-burgundy py-1.5 px-4 rounded-lg hover:bg-burgundy/90 transition-all shadow-sm">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending / Boosted Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <h3 className="font-black text-gray-900 text-[15px]">Boosted products</h3>
          <Link to="/shop" className="text-xs font-black text-burgundy hover:underline">
            See all
          </Link>
        </div>
        <div className="px-5 pb-5 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>)}
            </div>
          ) : boostedProducts.length > 0 ? (
            <>
              <div className="space-y-5">
                {boostedProducts.slice(0, 4).map((product) => (
                  <div key={product.productId} className="flex items-center justify-between group">
                    <Link to={`/products/${product.productId}`} className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={product.imageUrl ? getImageUrl(product.imageUrl) : (product.media?.[0]?.url ? getImageUrl(product.media[0].url) : 'https://via.placeholder.com/100')} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[13px] font-semibold text-gray-900 truncate group-hover:text-burgundy transition-colors">
                          {product.title}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{product.sellerName}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-burgundy bg-burgundy/5 hover:bg-burgundy/10 transition-colors flex-shrink-0">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Link to="/shop" className="block w-full text-center py-2.5 mt-2 border border-gray-200 rounded-lg text-xs font-bold text-burgundy hover:bg-gray-50 transition-colors">
                Explore More
              </Link>
            </>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No trending products yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeAside;
