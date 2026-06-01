import { useState, useEffect } from 'react';
import { 
  Heart, ShoppingCart, SlidersHorizontal, LayoutGrid, 
  List, ChevronDown, CheckCircle2, X 
} from 'lucide-react';
import { socialService } from '../../services/socialService';
import { cartService } from '../../services/cartService';
import { categoryService } from '../../services/categoryService';
import { useCartStore } from '../../store/cartStore';
import Container from '../../components/layout/Container';
import ProductGrid from '../../components/product/ProductGrid';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allProducts, selectedCategory, sortBy]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await socialService.getMySavedProducts();
      const items = data.content || data || [];
      setAllProducts(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...allProducts];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === parseInt(selectedCategory) || p.categoryName === selectedCategory);
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await socialService.unsaveProduct(productId);
      setAllProducts(prev => prev.filter(p => p.productId !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('No variants available');
      return;
    }
    try {
      await addItem(product.productId, product.variants[0].variantId, 1);
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleMoveAllToCart = async () => {
    if (filteredProducts.length === 0) return;
    
    try {
      setIsMovingAll(true);
      let count = 0;
      for (const product of filteredProducts) {
        if (product.variants && product.variants.length > 0) {
          try {
            await addItem(product.productId, product.variants[0].variantId, 1);
            count++;
          } catch (err) {
            console.error(`Error adding ${product.title}`);
          }
        }
      }
      if (count > 0) {
        toast.success(`Successfully moved ${count} items to cart!`);
      } else {
        toast.error('Could not move items to cart');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsMovingAll(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Accessing your archives..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">Filters</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showFilters && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-50 z-50 p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-900">Categories</h3>
                    <button onClick={() => setShowFilters(false)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-burgundy text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.categoryId}
                        onClick={() => setSelectedCategory(cat.categoryId)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.categoryId ? 'bg-burgundy text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest text-gray-900 focus:outline-none cursor-pointer"
              >
                <option value="newest">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white shadow-sm text-burgundy' : 'text-gray-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-burgundy' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={ShoppingCart}
              loading={isMovingAll}
              onClick={handleMoveAllToCart}
              className="rounded-xl px-6 h-[44px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-burgundy/10"
            >
              Move All to Cart
            </Button>
          </div>
        </div>

        {/* Content */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your collection is empty"
            description="Archive the pieces that inspire you and build your signature style."
            actionLabel="Discover Products"
            onAction={() => window.location.href = '/shop'}
          />
        ) : (
          <div className={viewType === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" : "space-y-6"}>
            <ProductGrid
              products={filteredProducts}
              onLike={handleRemoveFromWishlist}
              onAddToCart={handleAddToCart}
              viewType={viewType}
            />
          </div>
        )}
      </Container>
    </div>
  );
};

export default WishlistPage;