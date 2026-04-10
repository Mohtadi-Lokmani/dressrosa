import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { productService } from '../../services/productService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { formatPrice, getStatusColor } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const MyProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getMyProducts({
        page: currentPage,
        size: 10,
        search: debouncedSearch,
        sort: 'createdAt,desc',
      });

      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
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
      toast.success('Product deleted successfully');
      setDeleteModal({ show: false, productId: null });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && currentPage === 0) {
    return <Loading fullScreen text="Loading products..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Link to="/seller/products/add">
            <Button variant="primary" icon={Plus}>
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
            />
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No products yet"
            description="Start selling by adding your first product!"
            actionLabel="Add Product"
            onAction={() => navigate('/seller/products/add')}
          />
        ) : (
          <>
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Product
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Price
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Stock
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => {
                      const totalStock = product.variants?.reduce(
                        (sum, v) => sum + (v.quantity || 0),
                        0
                      ) || 0;

                      return (
                        <tr key={product.productId} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.media?.[0]?.url || 'https://via.placeholder.com/60'}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <Link
                                  to={`/products/${product.productId}`}
                                  className="font-medium text-gray-900 hover:text-burgundy line-clamp-1"
                                >
                                  {product.title}
                                </Link>
                                <p className="text-sm text-gray-500">
                                  {product.category?.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-sm ${totalStock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                              {totalStock} units
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={getStatusColor(product.status).variant}>
                              {product.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Link to={`/seller/products/edit/${product.productId}`}>
                                <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteModal({ show: true, productId: product.productId })}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, productId: null })}
          title="Delete Product"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ show: false, productId: null })}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
};

export default MyProductsPage;