import { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Trash2, Award, Zap, 
  ChevronLeft, ChevronRight, Eye, Heart, MessageSquare, ShoppingBag
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId]);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
      };
      const data = await adminService.getProducts(params);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleToggleBoost = async (productId) => {
    try {
      await adminService.toggleProductBoost(productId);
      toast.success('Product boost status updated');
      setProducts(products.map(p => p.productId === productId ? { ...p, isBoosted: !p.isBoosted } : p));
    } catch (error) {
      console.error('Error toggling product boost:', error);
      toast.error('Failed to toggle product boost');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product? This action is irreversible.')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Catalog & Moderation</h1>
            <p className="text-sm text-gray-500 mt-0.5">Moderate listing details, promote with boosts, or delete flagged items ({totalElements} items total)</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search products by title or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </form>

          <div className="flex gap-3">
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy transition-all font-semibold text-gray-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500">No products found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Seller / Atelier</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Stats</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {products.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                            {item.photoUrl ? (
                              <img
                                src={getImageUrl(item.photoUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-xs">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{item.sellerName || '—'}</p>
                          {item.sellerShopName && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.sellerShopName}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900">{formatPrice(item.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500">
                          {item.categoryName || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          item.status === 'IN_STOCK' ? 'badge-success' : 'badge-danger'
                        } text-xs font-bold`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-xs font-bold text-gray-400">
                          <span className="flex items-center space-x-1" title="Views">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{item.viewsCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1" title="Likes">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{item.likeCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1" title="Orders">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{item.orderCount || 0}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleBoost(item.productId)}
                            className={`p-2 border rounded-xl transition-all ${
                              item.isBoosted
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200'
                            }`}
                            title="Toggle Boost Status"
                          >
                            <Zap className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.productId)}
                            className="p-2 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50/50 transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProductsPage;
