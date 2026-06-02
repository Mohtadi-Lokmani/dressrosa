import { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Award, Trash2, Check, X, 
  ChevronLeft, ChevronRight, UserCheck, Shield
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Avatar from '../../components/common/Avatar';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        search: search.trim() || undefined,
        role: role || undefined,
      };
      const data = await adminService.getUsers(params);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleVerification = async (userId) => {
    try {
      await adminService.toggleVerification(userId);
      toast.success('User verification badge status toggled');
      setUsers(users.map(u => u.userId === userId ? { ...u, verificationBadge: !u.verificationBadge } : u));
    } catch (error) {
      console.error('Error toggling verification badge:', error);
      toast.error('Failed to toggle verification badge');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminService.changeUserRole(userId, newRole);
      toast.success(`Role updated successfully to ${newRole}`);
      setUsers(users.map(u => u.userId === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error('Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This action is irreversible and deletes all associated data.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage roles, verify sellers, and moderate accounts ({totalElements} users total)</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </form>

          <div className="flex gap-3">
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(0); }}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy transition-all font-semibold text-gray-600"
            >
              <option value="">All Roles</option>
              <option value="BUYER">Buyers</option>
              <option value="SELLER">Sellers (Ateliers)</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-24 text-center">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500">No users found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status & Badges</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {users.map((item) => (
                    <tr key={item.userId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Avatar src={item.profilePhoto} name={item.userName} size="md" />
                          <div>
                            <p className="font-bold text-gray-900">{item.userName}</p>
                            <p className="text-xs text-gray-400">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs">{item.telephone || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500">{item.city || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.role}
                          onChange={(e) => handleChangeRole(item.userId, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black focus:outline-none transition-all ${
                            item.role === 'ADMIN'
                              ? 'bg-burgundy/10 text-burgundy border border-burgundy/20'
                              : item.role === 'SELLER'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <option value="BUYER">BUYER</option>
                          <option value="SELLER">SELLER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleVerification(item.userId)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
                              item.verificationBadge
                                ? 'bg-burgundy/10 text-burgundy border-burgundy/20'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                            }`}
                            title="Toggle Verification Badge"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{item.verificationBadge ? 'Verified' : 'Unverified'}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(item.userId)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                          title="Delete User Account"
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

export default AdminUsersPage;
