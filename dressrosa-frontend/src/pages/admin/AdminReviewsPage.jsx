import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trash2, Star, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Avatar from '../../components/common/Avatar';
import { formatDate } from 'date-fns';
import toast from 'react-hot-toast';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { page, size: 10 };
      const data = await adminService.getReviews(params);
      setReviews(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product review?')) {
      return;
    }

    try {
      await adminService.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rate) => {
    return (
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < rate ? 'fill-current' : 'text-gray-200'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-6xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Review Moderation</h1>
            <p className="text-sm text-gray-500 mt-0.5">Moderate product ratings and comments posted by buyers ({totalElements} reviews total)</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-24 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500">No buyer reviews found in the system database</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Seller Info</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Comment</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {reviews.map((item) => (
                    <tr key={item.reviewId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2.5">
                          <Avatar src={item.userPhoto} name={item.userName} size="sm" />
                          <div>
                            <p className="font-bold text-gray-900">{item.userName}</p>
                            <p className="text-[10px] text-gray-400">ID: {item.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-xs">{item.productTitle}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {item.productId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{item.sellerName || '—'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {item.sellerId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(item.rate)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600 max-w-sm italic whitespace-pre-wrap">{item.comment || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">
                          {item.date ? formatDate(new Date(item.date), 'MMM dd, yyyy') : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(item.reviewId)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

export default AdminReviewsPage;
