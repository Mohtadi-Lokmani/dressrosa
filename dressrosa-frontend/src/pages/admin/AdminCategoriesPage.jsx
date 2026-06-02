import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Check, ShieldAlert, Award
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const data = await adminService.createCategory(newCategoryName.trim());
      toast.success('Category created successfully');
      setCategories([...categories, data]);
      setNewCategoryName('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingName.trim() || !editingCategory) return;

    try {
      const data = await adminService.updateCategory(editingCategory.categoryId, editingName.trim());
      toast.success('Category updated successfully');
      setCategories(categories.map(c => c.categoryId === editingCategory.categoryId ? data : c));
      setEditingCategory(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      return;
    }

    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted successfully');
      setCategories(categories.filter(c => c.categoryId !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-4xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Category CRUD Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Define new global category taxonomies or modify existing labels</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-burgundy to-burgundy-light hover:from-burgundy-light hover:to-burgundy text-white text-xs font-black rounded-xl shadow-lg shadow-burgundy/20 flex items-center gap-2 self-start transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Add Modal/Panel */}
        {showAddModal && (
          <div className="bg-white rounded-2xl p-6 border border-burgundy/10 shadow-xl shadow-burgundy/5 mb-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Create New Category</h3>
              <button 
                onClick={() => { setShowAddModal(false); setNewCategoryName(''); }}
                className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter unique category name (e.g. Handmade Crafts)..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all"
                required
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-gray-800 transition-all shadow-sm"
              >
                Create
              </button>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Taxonomies...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-24 text-center">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500">No categories found in the system database</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((c) => (
                <div 
                  key={c.categoryId} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  {editingCategory?.categoryId === c.categoryId ? (
                    <form onSubmit={handleUpdateCategory} className="flex-1 flex gap-3 mr-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all"
                        required
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-all"
                        title="Save Changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingCategory(null); setEditingName(''); }}
                        className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all"
                        title="Cancel Editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-burgundy rounded-full" />
                        <span className="font-bold text-gray-900 text-sm">{c.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {c.categoryId}</span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setEditingCategory(c); setEditingName(c.name); }}
                          className="p-2 border border-gray-200 hover:border-burgundy/20 text-gray-400 hover:text-burgundy rounded-xl hover:bg-burgundy/5 transition-all"
                          title="Edit Category Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.categoryId)}
                          className="p-2 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50/50 transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminCategoriesPage;
