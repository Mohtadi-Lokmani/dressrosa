import { useEffect, useMemo, useState } from 'react';
import { Plus, Folder, Trash2, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { collectionService } from '../../services/collectionService';
import { productService } from '../../services/productService';
import { getImageUrl } from '../../utils/helpers';

const StudioCollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [createModal, setCreateModal] = useState({ show: false, name: '' });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [search, setSearch] = useState('');

  const fetchCollections = async () => {
    try {
      setLoading(true);
      // sellerId is not needed here; backend infers from token for manage actions,
      // but for listing we can use /seller/:sellerId. We'll use the manage list by calling seller collections with "me" pattern isn't available.
      // So we rely on the public sellerId list only when we know sellerId; in Studio we don't, so we just ask backend for all by seller using token is not implemented.
      // Instead, call create/list by using current user's id via /users/me.
      // For now, we reuse getBySeller by reading sellerId from local storage user.
      const me = JSON.parse(localStorage.getItem('dressrosa_user') || 'null') || JSON.parse(localStorage.getItem('user') || 'null');
      const sellerId = me?.userId;
      if (!sellerId) throw new Error('Missing seller id');
      const data = await collectionService.getBySeller(sellerId);
      setCollections(Array.isArray(data) ? data : []);
      const first = (Array.isArray(data) ? data : [])[0]?.collectionId;
      setSelectedId((prev) => prev ?? first ?? null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await productService.getMyProducts({ page: 0, size: 200, sort: 'createdAt,desc' });
      setProducts(res.content || res || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSelectedItems = async (collectionId) => {
    if (!collectionId) return;
    try {
      setLoadingItems(true);
      const ids = await collectionService.getItems(collectionId);
      setSelectedProductIds(new Set((ids || []).map((x) => Number(x))));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load collection items');
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedId) fetchSelectedItems(selectedId);
  }, [selectedId]);

  const selectedCollection = useMemo(
    () => collections.find((c) => c.collectionId === selectedId) || null,
    [collections, selectedId]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.title || '').toLowerCase().includes(q));
  }, [products, search]);

  const handleCreate = async () => {
    const name = createModal.name.trim();
    if (!name) return toast.error('Collection name is required');
    try {
      setCreating(true);
      const created = await collectionService.create({ name });
      toast.success('Collection created');
      setCreateModal({ show: false, name: '' });
      await fetchCollections();
      if (created?.collectionId) setSelectedId(created.collectionId);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleting(true);
      await collectionService.delete(deleteModal.id);
      toast.success('Collection deleted');
      setDeleteModal({ show: false, id: null, name: '' });
      if (selectedId === deleteModal.id) setSelectedId(null);
      await fetchCollections();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete collection');
    } finally {
      setDeleting(false);
    }
  };

  const toggleProduct = async (productId) => {
    if (!selectedId) return toast.error('Select a collection first');
    const pid = Number(productId);
    const has = selectedProductIds.has(pid);
    try {
      if (has) {
        await collectionService.removeItem(selectedId, pid);
        setSelectedProductIds((prev) => {
          const next = new Set(prev);
          next.delete(pid);
          return next;
        });
      } else {
        await collectionService.addItem(selectedId, pid);
        setSelectedProductIds((prev) => new Set(prev).add(pid));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update collection');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Collections</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organize your products into shop collections.</p>
          </div>
          <button
            onClick={() => setCreateModal({ show: true, name: '' })}
            className="inline-flex items-center space-x-2 bg-burgundy text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-burgundy-dark transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Collections list */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Collections</p>
                <span className="text-xs font-bold text-gray-500">{collections.length}</span>
              </div>

              {loading ? (
                <div className="py-14 text-center">
                  <div className="spinner mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                </div>
              ) : collections.length === 0 ? (
                <div className="py-14 text-center px-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">No collections yet</p>
                  <p className="text-sm text-gray-400">Create your first collection to group products.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {collections.map((c) => (
                    <button
                      key={c.collectionId}
                      onClick={() => setSelectedId(c.collectionId)}
                      className={`w-full text-left px-5 py-4 hover:bg-gray-50/60 transition-colors ${
                        selectedId === c.collectionId ? 'bg-burgundy/5' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                          {c.coverImage || c.previewImages?.[0] ? (
                            <img
                              src={getImageUrl(c.coverImage || c.previewImages[0])}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Folder className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.itemsCount || 0} items</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ show: true, id: c.collectionId, name: c.name });
                          }}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products selector */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-gray-900">{selectedCollection ? selectedCollection.name : 'Select a collection'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {loadingItems ? 'Loading items…' : `${selectedProductIds.size} selected`}
                  </p>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loadingProducts ? (
                <div className="py-20 text-center">
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-gray-500">No products found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredProducts.map((p) => {
                    const cover = p.media?.[0]?.url ? getImageUrl(p.media[0].url) : (p.imageUrl ? getImageUrl(p.imageUrl) : null);
                    const checked = selectedProductIds.has(Number(p.productId));
                    return (
                      <div key={p.productId} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                            {cover ? (
                              <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Folder className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{p.title}</p>
                            <p className="text-xs text-gray-400 truncate">{p.categoryName || p.category?.name || '—'}</p>
                          </div>
                        </div>
                        <button
                          disabled={!selectedId}
                          onClick={() => toggleProduct(p.productId)}
                          className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                            checked
                              ? 'bg-burgundy text-white border-burgundy'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          } ${!selectedId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {checked ? (
                            <span className="inline-flex items-center space-x-2">
                              <Check className="w-4 h-4" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            'Add'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={createModal.show}
          onClose={() => setCreateModal({ show: false, name: '' })}
          title="Create Collection"
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Name</label>
              <input
                value={createModal.name}
                onChange={(e) => setCreateModal((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. New Arrivals"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setCreateModal({ show: false, name: '' })}>
                Cancel
              </Button>
              <Button variant="primary" loading={creating} onClick={handleCreate}>
                Create
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, id: null, name: '' })}
          title="Delete Collection"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Delete <span className="font-bold text-gray-900">"{deleteModal.name}"</span>? This cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
                Cancel
              </Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default StudioCollectionsPage;

