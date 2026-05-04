import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, ArrowRight, Heart } from 'lucide-react';
import { productService } from '../../services/productService';
import Avatar from '../common/Avatar';
import { formatPrice } from '../../utils/formatters';

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
              image: p.sellerProfileImage
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
      {/* Boosted Products - Replaced Trending */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-gray-900 flex items-center space-x-2 text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-burgundy fill-burgundy/10" />
            <span>Boosted Products</span>
          </h3>
          <Link to="/shop" className="text-[10px] font-black text-burgundy uppercase tracking-widest hover:underline">
            View all
          </Link>
        </div>
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>)}
            </div>
          ) : boostedProducts.length > 0 ? (
            boostedProducts.map((product) => (
              <Link key={product.productId} to={`/products/${product.productId}`} className="flex items-center space-x-3 group">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={product.media?.[0]?.url || 'https://via.placeholder.com/100'} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-burgundy transition-colors">
                    {product.title}
                  </p>
                  <p className="text-[11px] text-gray-400 font-semibold truncate italic">by {product.sellerName}</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                    <span className="text-[10px] font-black text-gray-600">{product.likeCount || 0}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No boosted products yet</p>
          )}
        </div>
      </div>

      {/* Suggested Pages - Replaced Suggested Ateliers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-gray-900 flex items-center space-x-2 text-sm uppercase tracking-wider">
            <Users className="w-4 h-4 text-burgundy" />
            <span>Suggested Pages</span>
          </h3>
          <Link to="/shop" className="text-[10px] font-black text-burgundy uppercase tracking-widest hover:underline">
            See All
          </Link>
        </div>
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl"></div>)}
            </div>
          ) : suggestedSellers.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between">
              <Link to={`/seller/${seller.id}`} className="flex items-center space-x-3 group">
                <Avatar src={seller.image} name={seller.name} size="md" className="ring-2 ring-burgundy/10 group-hover:ring-burgundy/30 transition-all" />
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-burgundy transition-colors">
                    {seller.name}
                  </p>
                  <p className="text-[11px] text-gray-400 font-semibold">{seller.city}</p>
                </div>
              </Link>
              <button className="text-[10px] font-black text-burgundy bg-burgundy/5 py-1.5 px-4 rounded-full hover:bg-burgundy hover:text-white transition-all uppercase tracking-wider shadow-sm">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User's custom banner area - Clean & professional */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-5 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#FDF4F6] rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-burgundy" />
        </div>
        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Elevate your Style</h4>
        <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mb-4">
          Experience the finest curation of artisanal fashion from around the globe.
        </p>
        <Link to="/shop" className="w-full bg-burgundy text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-burgundy/20 hover:bg-burgundy-dark transition-all flex items-center justify-center space-x-2">
          <span>Explore Now</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default HomeAside;
