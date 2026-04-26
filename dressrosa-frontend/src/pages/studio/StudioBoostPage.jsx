import { useState, useEffect } from 'react';
import { 
  Rocket, 
  Zap, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StudioBoostPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [boostingProductId, setBoostingProductId] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getMyProducts({ size: 100 });
      setProducts(data.content || []);
    } catch (error) {
      console.error('Error fetching products for boosting:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBoost = async (productId) => {
    try {
      setBoostingProductId(productId);
      const updatedProduct = await productService.toggleBoost(productId);
      
      setProducts(prev => prev.map(p => 
        p.productId === productId ? updatedProduct : p
      ));
      
      if (updatedProduct.isBoosted) {
        toast.success('Product boosted successfully! 🚀');
      } else {
        toast.success('Boost removed');
      }
    } catch (error) {
      console.error('Error toggling boost:', error);
      toast.error('Failed to update promotion status');
    } finally {
      setBoostingProductId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const boostedCount = products.filter(p => p.isBoosted).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-dark to-black p-10 text-white overflow-hidden mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
              Dressrosa Ads & Growth
            </span>
          </div>
          <h1 className="text-4xl font-black mb-4">Elevate Your Atelier Presence</h1>
          <p className="text-burgundy-light text-lg mb-8 opacity-90 leading-relaxed">
            Boosted products appear at the top of the Marketplace and are featured in the "For You" feeds. 
            Sellers who boost see an average of <span className="text-white font-bold">3.5x higher engagement</span>.
          </p>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-burgundy-light" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-60">Visibility</p>
                <p className="text-sm font-black">+250% Reach</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-burgundy-light" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-60">Conversion</p>
                <p className="text-sm font-black">Top Ranking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 p-10 opacity-10">
          <Rocket className="w-64 h-64 rotate-12" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Boosts</p>
            <h3 className="text-xl font-black text-gray-900">{boostedCount} {boostedCount === 1 ? 'Product' : 'Products'}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Potential</p>
            <h3 className="text-xl font-black text-gray-900">High Score</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atelier Rating</p>
            <h3 className="text-xl font-black text-gray-900">Elite Tier</h3>
          </div>
        </div>
      </div>

      {/* Product List Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">Product Promotion Manager</h2>
            <p className="text-xs text-gray-500 font-medium">Select products you want to prioritize in the marketplace.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search products to boost..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-burgundy/10 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm italic">Scanning your inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500 text-sm mt-2">Try searching with a different term or add new products.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredProducts.map((product) => (
              <div 
                key={product.productId}
                className={`p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group ${
                  product.isBoosted ? 'bg-burgundy/[0.02]' : ''
                }`}
              >
                <div className="flex items-center space-x-5 flex-1 min-w-0">
                  <div className="relative">
                    <img 
                      src={product.imageUrl || '/placeholder-product.png'} 
                      alt={product.title}
                      className="w-16 h-20 object-cover rounded-xl shadow-sm bg-gray-100"
                    />
                    {product.isBoosted && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-burgundy rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <Zap className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-burgundy transition-colors">
                        {product.title}
                      </h4>
                      {product.isBoosted && (
                        <span className="px-2 py-0.5 bg-burgundy/10 text-burgundy text-[9px] font-black uppercase tracking-widest rounded-md">
                          Boosted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 font-bold">
                      <span className="text-gray-900">{formatPrice(product.price)}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{product.viewsCount} views</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  {product.isBoosted ? (
                    <button 
                      onClick={() => handleToggleBoost(product.productId)}
                      disabled={boostingProductId === product.productId}
                      className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center space-x-2"
                    >
                      {boostingProductId === product.productId ? (
                        <div className="w-3 h-3 border-2 border-indigo-700/20 border-t-indigo-700 rounded-full animate-spin"></div>
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span>Stop Boost</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggleBoost(product.productId)}
                      disabled={boostingProductId === product.productId}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center space-x-2 group-hover:scale-105"
                    >
                      {boostingProductId === product.productId ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Rocket className="w-4 h-4" />
                      )}
                      <span>Boost Now</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900">How to choose what to boost?</h3>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed mb-4">
            Boosting works best for products that already have high-quality photos and competitive pricing. 
            Select your "Hero Products" - the ones that best represent your atelier's style.
          </p>
          <button className="text-amber-900 text-xs font-bold flex items-center space-x-1 hover:underline">
            <span>Read Boost Guide</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Boost Benefits</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
              <span>Placement in the "Suggested for You" carousel.</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
              <span>Exclusive "Trending Product" badge on thumbnail.</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
              <span>Detailed click-through analytics on your dashboard.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudioBoostPage;
