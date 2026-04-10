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
import { ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { SORT_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt,desc');

  // Separate filters state and applied filters
  const [filters, setFilters] = useState({
    sizes: [],
    colors: [],
    minPrice: null,
    maxPrice: null,
    minRating: null,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    sizes: [],
    colors: [],
    minPrice: null,
    maxPrice: null,
    minRating: null,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when applied filters/page/category/sort changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, appliedFilters, currentPage, sortBy]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = {
        page: currentPage,
        size: 18,
        sort: sortBy,
        status: 'IN_STOCK',
      };

      // Add category filter
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      // Add price filters
      if (appliedFilters.minPrice) {
        params.minPrice = appliedFilters.minPrice;
      }
      if (appliedFilters.maxPrice) {
        params.maxPrice = appliedFilters.maxPrice;
      }

      const response = await productService.search(params);
      let filteredProducts = response.content || [];

      // Apply client-side filters (size, color, rating)
      // These need to be done client-side unless backend supports them
      if (appliedFilters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.variants?.some(v => 
            appliedFilters.sizes.includes(v.size)
          )
        );
      }

      if (appliedFilters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.variants?.some(v => 
            appliedFilters.colors.includes(v.color)
          )
        );
      }

      if (appliedFilters.minRating) {
        filteredProducts = filteredProducts.filter(product =>
          (product.averageRating || 0) >= appliedFilters.minRating
        );
      }

      setProducts(filteredProducts);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(0); // Reset to first page when filters change
    toast.success('Filters applied!');
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      sizes: [],
      colors: [],
      minPrice: null,
      maxPrice: null,
      minRating: null,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(0);
    toast.success('Filters cleared!');
  };

  const handleLike = async (productId) => {
    try {
      await socialService.likeProduct(productId);
      toast.success('Product liked!');
    } catch (error) {
      console.error('Error liking product:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(0);
  };

  // Check if filters have changed
  const hasUnappliedFilters = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
              <p className="text-gray-600 text-sm mt-1">
                Discover amazing products
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-burgundy text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-burgundy'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => handleCategoryChange(category.categoryId)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.categoryId
                    ? 'bg-burgundy text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-burgundy'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
              
              {/* Apply Filters Button */}
              <div className="mt-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleApplyFilters}
                  disabled={!hasUnappliedFilters}
                >
                  Apply Filters
                </Button>
                {hasUnappliedFilters && (
                  <p className="text-sm text-burgundy text-center mt-2">
                    Click to apply changes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 text-sm">
                {loading ? 'Loading...' : `${products.length} products found`}
              </p>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeedSkeleton count={6} />
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No products found"
                description="Try adjusting your filters or search criteria"
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            ) : (
              <>
                <ProductGrid products={products} onLike={handleLike} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ShopPage;