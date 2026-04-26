import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit3, Trash2, Eye,
  Package, Filter, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  IN_STOCK: { label: 'Live', color: 'bg-green-100 text-green-700' },
  SOLD_OUT: { label: 'Sold Out', color: 'bg-red-100 text-red-600' },
};

const FILTERS = ['All', 'IN_STOCK', 'SOLD_OUT'];

const StudioProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 12,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        sort: 'createdAt,desc',
      };
      const response = await productService.getMyProducts(params);
      setProducts(response.content || response || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.productId) return;
    try {
      setDeleting(true);
      await productService.delete(deleteModal.productId);
      toast.success('Product deleted');
      setDeleteModal({ show: false, productId: null, title: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const totalStock = (product) =>
    product.variants?.reduce((s, v) => s + (v.quantity || 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalElements} product{totalElements !== 1 ? 's' : ''} in your catalog
            </p>
          </div>
          <Link to="/studio/products/add">
            <button className="inline-flex items-center space-x-2 bg-burgundy text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-burgundy-dark transition-all shadow-sm hover:shadow-md active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </Link>
        </div>

        {/* Controls Row */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-5 flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setCurrentPage(0); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f
                    ? 'bg-burgundy text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'IN_STOCK' ? 'Live' : f === 'SOLD_OUT' ? 'Sold Out' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-bold text-gray-700 mb-1">
                {searchQuery ? 'No products match your search' : 'No products yet'}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term.' : 'Start by adding your first product to the catalog.'}
              </p>
              {!searchQuery && (
                <Link to="/studio/products/add">
                  <button className="inline-flex items-center space-x-2 bg-burgundy text-white font-bold text-sm px-5 py-2.5 rounded-xl">
                    <Plus className="w-4 h-4" />
                    <span>Add First Product</span>
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[2.5rem_1fr_6rem_5rem_5rem_5rem_6rem] gap-4 items-center px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                <div />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Views</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</p>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {products.map((product) => {
                  const coverImage = product.media?.[0]?.url ? getImageUrl(product.media[0].url) : null;
                  const stock = totalStock(product);
                  const statusMeta = STATUS_LABELS[product.status] || STATUS_LABELS.IN_STOCK;

                  return (
                    <div
                      key={product.productId}
                      className="grid grid-cols-[2.5rem_1fr_6rem_5rem_5rem_5rem_6rem] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {coverImage ? (
                          <img src={coverImage} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-burgundy transition-colors">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{product.category?.name || '—'}</p>
                      </div>

                      {/* Price */}
                      <p className="text-sm font-black text-gray-900">{formatPrice(product.price)}</p>

                      {/* Stock */}
                      <p className={`text-sm font-bold ${stock > 0 ? 'text-gray-700' : 'text-red-500'}`}>
                        {stock} units
                      </p>

                      {/* Status */}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>

                      {/* Views */}
                      <p className="text-sm text-gray-400 font-semibold flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{product.viewCount ?? 0}</span>
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-1">
                        <Link to={`/studio/products/${product.productId}/edit`}>
                          <button className="p-2 text-gray-400 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-all" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link to={`/products/${product.productId}`} target="_blank">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View in Market">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ show: true, productId: product.productId, title: product.title })}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-50">
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, productId: null, title: '' })}
        title="Delete Product"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteModal.title}"</span>?
          </p>
          <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
          <div className="flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModal({ show: false, productId: null, title: '' })}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudioProductsPage;
