import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Download } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const MySalesPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updateModal, setUpdateModal] = useState({ show: false, orderId: null, currentStatus: null });
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMySales({
        page: currentPage,
        size: 10,
        sort: 'orderDate,desc',
      });

      let filteredOrders = response.content || [];
      
      if (statusFilter !== 'ALL') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }

      setOrders(filteredOrders);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateModal.orderId || !newStatus) return;

    try {
      setUpdating(true);
      await orderService.updateStatus(updateModal.orderId, newStatus);
      toast.success('Order status updated');
      setUpdateModal({ show: false, orderId: null, currentStatus: null });
      setNewStatus('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (orderId, currentStatus) => {
    setUpdateModal({ show: true, orderId, currentStatus });
    setNewStatus(currentStatus);
  };

  const calculateTotal = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  if (loading && currentPage === 0) {
    return <Loading fullScreen text="Loading sales..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sales</h1>
          <p className="text-gray-600">Manage orders and track sales</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-gray-600 text-sm mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-gray-600 text-sm mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatPrice(calculateTotal())}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-gray-600 text-sm mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter(o => o.status === ORDER_STATUS.PENDING).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-burgundy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {Object.values(ORDER_STATUS).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-burgundy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Download}
            title="No sales yet"
            description="Orders from customers will appear here"
          />
        ) : (
          <>
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Order ID
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Customer
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Items
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                        Total
                      </th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <Link
                            to={`/orders/${order.orderId}`}
                            className="font-medium text-burgundy hover:text-burgundy-dark"
                          >
                            #{order.orderId}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {order.buyer?.userName}
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {order.orderItems?.length || 0} items
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={getStatusColor(order.status).variant}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateModal(order.orderId, order.status)}
                          >
                            Update Status
                          </Button>
                        </td>
                      </tr>
                    ))}
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

        {/* Update Status Modal */}
        <Modal
          isOpen={updateModal.show}
          onClose={() => setUpdateModal({ show: false, orderId: null, currentStatus: null })}
          title="Update Order Status"
        >
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              >
                {Object.values(ORDER_STATUS)
                  .filter(status => status !== ORDER_STATUS.CANCELLED)
                  .map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setUpdateModal({ show: false, orderId: null, currentStatus: null })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={updating}
                onClick={handleUpdateStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
};

export default MySalesPage;