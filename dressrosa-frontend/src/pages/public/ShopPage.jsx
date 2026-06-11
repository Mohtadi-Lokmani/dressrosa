import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { socialService } from '../../services/socialService';
import Container from '../../components/layout/Container';
import ProductFilters from '../../components/product/ProductFilters';
import ProductGrid from '../../components/product/ProductGrid';
import FeedSkeleton from '../../components/feed/FeedSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { ShoppingBag, SlidersHorizontal, LayoutGrid, List, X, Leaf, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { SORT_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'

  const initialCat = searchParams.get('cat') ? Number(searchParams.get('cat')) : null;
  const initialPage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;
  
  const initialFilters = {
    sizes: searchParams.get('size') ? searchParams.get('size').split(',') : [],
    colors: searchParams.get('color') ? searchParams.get('color').split(',') : [],
    minPrice: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : null,
    maxPrice: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : null,
    minRating: searchParams.get('ratingMin') ? Number(searchParams.get('ratingMin')) : null,
    search: searchParams.get('search') || '',
  };

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [totalPages, setTotalPages] = useState(0);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('cat') ? Number(searchParams.get('cat')) : null);
    setCurrentPage(searchParams.get('page') ? Number(searchParams.get('page')) : 0);
    const updatedFilters = {
      sizes: searchParams.get('size') ? searchParams.get('size').split(',') : [],
      colors: searchParams.get('color') ? searchParams.get('color').split(',') : [],
      minPrice: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : null,
      maxPrice: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : null,
      minRating: searchParams.get('ratingMin') ? Number(searchParams.get('ratingMin')) : null,
      search: searchParams.get('search') || '',
    };
    setFilters(updatedFilters);
    setAppliedFilters(updatedFilters);
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, appliedFilters, currentPage, sortBy]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20, // Increased for better layout
        sort: sortBy,
        status: 'IN_STOCK',
      };
      if (selectedCategory) params.categoryId = selectedCategory;
      if (appliedFilters.minPrice) params.minPrice = appliedFilters.minPrice;
      if (appliedFilters.maxPrice) params.maxPrice = appliedFilters.maxPrice;
      if (appliedFilters.search) params.search = appliedFilters.search;

      const response = await productService.search(params);
      let filteredProducts = response.content || [];

      if (appliedFilters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(p => p.variants?.some(v => appliedFilters.sizes.includes(v.size)));
      }
      if (appliedFilters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(p => p.variants?.some(v => appliedFilters.colors.includes(v.color)));
      }
      if (appliedFilters.minRating) {
        filteredProducts = filteredProducts.filter(p => (p.averageRating || 0) >= appliedFilters.minRating);
      }

      setProducts(filteredProducts);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (cat, page, filts) => {
    const params = new URLSearchParams();
    if (cat) params.set('cat', cat);
    if (page > 0) params.set('page', page);
    if (filts.minPrice) params.set('priceMin', filts.minPrice);
    if (filts.maxPrice) params.set('priceMax', filts.maxPrice);
    if (filts.sizes?.length > 0) params.set('size', filts.sizes.join(','));
    if (filts.colors?.length > 0) params.set('color', filts.colors.join(','));
    if (filts.minRating) params.set('ratingMin', filts.minRating);
    if (filts.search) params.set('search', filts.search);
    setSearchParams(params);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(0);
    updateUrlParams(selectedCategory, 0, filters);
    setShowFiltersModal(false);
  };

  const handleClearFilters = () => {
    const empty = { sizes: [], colors: [], minPrice: null, maxPrice: null, minRating: null, search: '' };
    setFilters(empty);
    setAppliedFilters(empty);
    setCurrentPage(0);
    updateUrlParams(selectedCategory, 0, empty);
    setShowFiltersModal(false);
  };

  const handleCategoryChange = (categoryId) => {
    const newCat = categoryId === selectedCategory ? null : categoryId;
    setSelectedCategory(newCat);
    setCurrentPage(0);
    updateUrlParams(newCat, 0, appliedFilters);
  };

  const removeFilterTag = (type, value) => {
    let newFilters = { ...filters };
    if (type === 'size') newFilters.sizes = filters.sizes.filter(s => s !== value);
    if (type === 'color') newFilters.colors = filters.colors.filter(c => c !== value);
    if (type === 'price') { newFilters.minPrice = null; newFilters.maxPrice = null; }
    if (type === 'rating') newFilters.minRating = null;
    if (type === 'search') newFilters.search = '';
    
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    updateUrlParams(selectedCategory, currentPage, newFilters);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateUrlParams(selectedCategory, newPage, appliedFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = async (productId) => {
    try {
      // Optimistic UI update
      setProducts(prev => prev.map(p => {
        if (p.productId === productId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1)
          };
        }
        return p;
      }));

      await socialService.likeProduct(productId);
      // Removed toast for a more subtle experience, or keep it if desired
    } catch (error) {
      console.error('Error liking product:', error);
      // Rollback on error if necessary
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      toast.error('No variants available for this product');
      return;
    }

    try {
      // Pick the first available variant
      const firstVariant = product.variants[0];
      await addItem(product.productId, firstVariant.variantId, 1);
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const activeFilterCount = appliedFilters.sizes.length + appliedFilters.colors.length + 
    (appliedFilters.minPrice || appliedFilters.maxPrice ? 1 : 0) + (appliedFilters.minRating ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8">
        {/* Category Pill Bar */}
        <div className="relative flex items-center mb-10 group">
          <div className="flex-1 flex items-center space-x-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm ${
                selectedCategory === null
                  ? 'bg-burgundy text-white shadow-burgundy/20'
                  : 'bg-white text-burgundy border border-burgundy/10 hover:border-burgundy/30 hover:bg-[#FDF4F6]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => handleCategoryChange(cat.categoryId)}
                className={`px-6 py-2 rounded-full text-[12px] font-black whitespace-nowrap uppercase tracking-widest transition-all duration-500 shadow-sm ${
                  selectedCategory === cat.categoryId
                    ? 'bg-burgundy text-white shadow-burgundy/20'
                    : 'bg-white text-burgundy border border-burgundy/10 hover:border-burgundy/30 hover:bg-[#FDF4F6]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Subtle scroll arrow as seen in design */}
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-burgundy/10 bg-white text-burgundy ml-4 cursor-pointer hover:bg-[#FDF4F6] transition-colors">
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </div>
        </div>

        {/* Toolbar Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#FDF4F6] text-burgundy rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-burgundy/10 transition-all border border-burgundy/5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-burgundy text-white text-[9px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 opacity-30" />
            </button>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-2">
              {products.length} products found
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-100 rounded-xl px-5 py-2.5 pr-10 text-[11px] font-black text-gray-900 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-burgundy/5 hover:border-gray-200 transition-all cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-burgundy pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-100">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-burgundy shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white text-burgundy shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(activeFilterCount > 0 || appliedFilters.search) && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {appliedFilters.search && (
              <div className="flex items-center space-x-2 bg-burgundy text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm shadow-burgundy/10 animate-fade-in">
                <span>Search: "{appliedFilters.search}"</span>
                <button onClick={() => removeFilterTag('search', '')}><X className="w-3 h-3" /></button>
              </div>
            )}
            {appliedFilters.sizes.map(s => (
              <div key={s} className="flex items-center space-x-2 bg-[#FDF4F6] text-burgundy px-4 py-2 rounded-full border border-burgundy/5 text-[10px] font-black uppercase tracking-widest">
                <span>{s}</span>
                <button onClick={() => removeFilterTag('size', s)}><X className="w-3 h-3" /></button>
              </div>
            ))}
            {appliedFilters.colors.map(c => (
              <div key={c} className="flex items-center space-x-2 bg-[#FDF4F6] text-burgundy px-4 py-2 rounded-full border border-burgundy/5 text-[10px] font-black uppercase tracking-widest">
                <span>{c}</span>
                <button onClick={() => removeFilterTag('color', c)}><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button 
              onClick={handleClearFilters}
              className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-burgundy px-4 py-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <FeedSkeleton count={10} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No products found"
            description="Try adjusting your filters"
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <>
            <div className={viewType === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" : ""}>
              <ProductGrid 
                products={products} 
                onLike={handleLike} 
                onAddToCart={handleAddToCart}
                viewType={viewType} 
              />
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Container>

      {/* Filter Modal Overlay */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowFiltersModal(false)}></div>
            <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden transform transition-all">
              <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Filters</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Refine your search</p>
                </div>
                <button onClick={() => setShowFiltersModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors group">
                  <X className="w-6 h-6 text-gray-400 group-hover:text-burgundy" />
                </button>
              </div>
              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                <ProductFilters
                  filters={filters}
                  onFilterChange={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
                  onClearFilters={handleClearFilters}
                />
              </div>
              <div className="p-8 bg-gray-50/50 flex items-center space-x-3 border-t border-gray-100">
                <Button variant="outline" fullWidth size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest" onClick={handleClearFilters}>Clear all</Button>
                <Button variant="primary" fullWidth size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-burgundy/10" onClick={handleApplyFilters}>Show Products</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;