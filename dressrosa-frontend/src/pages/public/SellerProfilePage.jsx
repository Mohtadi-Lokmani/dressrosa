import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Calendar, MapPin, ShoppingBag, CheckCircle2, Heart, ArrowLeft } from 'lucide-react';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { socialService } from '../../services/socialService';
import { collectionService } from '../../services/collectionService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import { formatDate, formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SellerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loadingCollectionItems, setLoadingCollectionItems] = useState(false);

  const handleSelectCollection = async (collection) => {
    try {
      setLoadingCollectionItems(true);
      setSelectedCollection(collection);
      setActiveTab('shop');
      const items = await collectionService.getItems(collection.collectionId);
      setSelectedCollection({ ...collection, products: items });
    } catch (e) {
      console.error('Error fetching collection items:', e);
      toast.error('Failed to load collection products');
    } finally {
      setLoadingCollectionItems(false);
    }
  };

  useEffect(() => {
    fetchSellerInfo();
  }, [id]);

  const fetchSellerInfo = async () => {
    try {
      setLoading(true);
      const data = await userService.getSellerProfile(id);
      setSeller(data);

      if (currentUser) {
        const followStatus = await socialService.checkFollow(id);
        setIsFollowing(followStatus);
      }

      fetchSellerProducts();
      fetchCollections();
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      toast.error('Seller not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    try {
      setLoadingProducts(true);
      const result = await productService.getBySeller(id);
      setProducts(result.content || result || []);
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const data = await collectionService.getBySeller(id);
      setCollections(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching collections:', e);
    }
  };

  const fetchSellerReviews = async () => {
    try {
      const data = await socialService.getSellerReviews(id, { page: 0, size: 10 });
      setReviews(data.content || []);
    } catch (e) {
      console.error('Error fetching seller reviews:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') fetchSellerReviews();
  }, [activeTab]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please log in to follow sellers');
      return;
    }

    try {
      if (isFollowing) {
        await socialService.unfollowSeller(id);
        toast.success('Unfollowed');
      } else {
        await socialService.followSeller(id);
        toast.success('Following');
      }
      setIsFollowing(!isFollowing);
      // Optimistically update followers count
      setSeller(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading seller profile..." />;
  }

  if (!seller) return null;

  const SellerProductCard = ({ product }) => {
    const imageUrl = product?.imageUrl || product?.media?.[0]?.url || product?.mediaList?.[0]?.url;
    const rating = Number(product?.averageRating || 0);
    const reviewCount = Number(product?.reviewsCount || product?.reviews || 0);

    return (
      <div
        onClick={() => navigate(`/products/${product.productId}`)}
        className="group cursor-pointer"
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          {imageUrl ? (
            <img
              src={getImageUrl(imageUrl)}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No image</div>
          )}

          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-burgundy transition-colors"
            aria-label="Like"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-3">
          <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
            {product.title}
          </p>
          <p className="mt-1 text-sm font-extrabold text-gray-900">
            {formatPrice(product.price)}
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <div className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-700">{rating ? rating.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span>{reviewCount}</span>
          </div>
        </div>
      </div>
    );
  };

  const isVerified = !!seller.verificationBadge;
  const topCollections = collections.slice(0, 5);
  const bestSelling = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Container className="py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left content */}
          <div className="lg:col-span-8 space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-5">
                <Avatar src={seller.profilePhoto} name={seller.userName} size="2xl" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight truncate">{seller.userName}</h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy/5 border border-burgundy/10 text-burgundy text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified Seller</span>
                      </span>
                    )}
                  </div>

                  {seller.bio && (
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xl">{seller.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{seller.city || seller.address || '—'}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Joined {formatDate(seller.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-5">
                    {currentUser?.userId !== seller.userId && (
                      <>
                        <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={handleFollow}>
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button variant="outline" onClick={() => navigate(`/messages?user=${seller.userId}`)}>
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right stats mini-cards (no response time / no delivery time) */}
                <div className="hidden md:flex flex-col gap-2.5 min-w-[170px]">
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-[#fcfcfd] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                      <Star className="w-4 h-4 text-burgundy" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400">Seller Rating</p>
                      <p className="text-sm font-bold text-gray-900">{(seller.averageRating || 0).toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-[#fcfcfd] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400">Orders Completed</p>
                      <p className="text-sm font-bold text-gray-900">{seller.ordersCompleted || 0}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-[#fcfcfd] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400">Followers</p>
                      <p className="text-sm font-bold text-gray-900">{seller.followersCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 px-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-7 overflow-x-auto scrollbar-hide border-b border-gray-100">
                {[
                  { id: 'shop', label: 'Shop' },
                  { id: 'products', label: `Products (${products.length})` },
                  { id: 'reviews', label: `Reviews` },
                  { id: 'about', label: 'About' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                      activeTab === t.id ? 'text-burgundy border-b-2 border-burgundy' : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="py-5">
                {/* Shop tab */}
                {activeTab === 'shop' && (
                  selectedCollection ? (
                    <div className="space-y-6 animate-slide-in">
                      {/* Collection Header */}
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setSelectedCollection(null)}
                          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-burgundy transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Shop</span>
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-burgundy/5 text-burgundy px-3 py-1.5 rounded-full border border-burgundy/10">
                          Collection
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-[#fcfcfd] rounded-2xl border border-gray-200">
                        {(selectedCollection.coverImage || selectedCollection.previewImages?.[0]) && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-gray-100">
                            <img 
                              src={getImageUrl(selectedCollection.coverImage || selectedCollection.previewImages[0])} 
                              alt={selectedCollection.name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedCollection.name}</h2>
                          {selectedCollection.description && (
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xl">{selectedCollection.description}</p>
                          )}
                          <p className="text-[10px] font-black text-gray-400 mt-2.5 uppercase tracking-widest">{selectedCollection.products?.length ?? selectedCollection.itemsCount ?? 0} Products Available</p>
                        </div>
                      </div>

                      {/* Products Grid */}
                      {loadingCollectionItems ? (
                        <div className="py-12 flex justify-center"><div className="spinner" /></div>
                      ) : selectedCollection.products?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                          {selectedCollection.products.map((p) => (
                            <SellerProductCard key={p.productId} product={p} />
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                          This collection doesn't have any products yet.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Collections */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-lg font-bold text-gray-900">Shop Collections</h2>
                          <button className="text-xs font-bold text-burgundy hover:underline" onClick={() => setActiveTab('about')}>
                            View All Collections →
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {topCollections.map((c) => (
                            <div 
                              key={c.collectionId} 
                              onClick={() => handleSelectCollection(c)}
                              className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:border-burgundy/30 group/card transition-all duration-300 hover:shadow-sm"
                            >
                              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                {(c.coverImage || c.previewImages?.[0]) ? (
                                  <img
                                    src={getImageUrl(c.coverImage || c.previewImages[0])}
                                    alt={c.name}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No image</div>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover/card:text-burgundy transition-colors">{c.name}</p>
                                <p className="text-xs text-gray-500">{c.itemsCount || 0} items</p>
                              </div>
                            </div>
                          ))}
                          {topCollections.length === 0 && (
                            <div className="col-span-2 md:col-span-5 text-sm text-gray-500 py-6 text-center">
                              No collections yet.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Best selling products */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-lg font-bold text-gray-900">Best Selling Products</h2>
                          <button className="text-xs font-bold text-burgundy hover:underline" onClick={() => setActiveTab('products')}>
                            View All Products →
                          </button>
                        </div>
                        {loadingProducts ? (
                          <div className="py-10 flex justify-center"><div className="spinner" /></div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {bestSelling.map((p) => (
                              <SellerProductCard key={p.productId} product={p} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Products tab */}
                {activeTab === 'products' && (
                  <>
                    {loadingProducts ? (
                      <div className="py-12 flex justify-center"><div className="spinner"></div></div>
                    ) : products.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                          <SellerProductCard key={product.productId} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <p>This seller hasn't posted any products yet.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Reviews tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div key={r.reviewId} className="p-4 rounded-xl border border-gray-200 bg-[#fcfcfd]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar src={r.userPhoto} name={r.userName} size="sm" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{r.userName}</p>
                                <p className="text-xs text-gray-500">{formatDate(r.date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < (r.rate || 0) ? 'fill-burgundy text-burgundy' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.comment}</p>}
                          <p className="text-xs text-gray-400 mt-3">On: {r.productTitle}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-sm text-gray-500">No reviews yet.</div>
                    )}
                  </div>
                )}

                {/* About tab (keep, but remove response time / badges / shop policies) */}
                {activeTab === 'about' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-gray-200 bg-[#fcfcfd]">
                      <p className="text-sm font-bold text-gray-900 mb-2">About the Seller</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{seller.bio || '—'}</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="text-xs font-semibold text-gray-500">Member since</span>
                          <span className="text-xs font-bold text-gray-900">{formatDate(seller.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="text-xs font-semibold text-gray-500">Products</span>
                          <span className="text-xs font-bold text-gray-900">{seller.totalProducts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="text-xs font-semibold text-gray-500">Followers</span>
                          <span className="text-xs font-bold text-gray-900">{seller.followersCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="text-xs font-semibold text-gray-500">Orders Completed</span>
                          <span className="text-xs font-bold text-gray-900">{seller.ordersCompleted || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 bg-[#fcfcfd]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-gray-900">All Collections</p>
                      </div>
                      {collections.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {collections.map((c) => (
                            <div
                              key={c.collectionId}
                              onClick={() => { setActiveTab('shop'); handleSelectCollection(c); }}
                              className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-burgundy/30 group/card transition-all duration-300 hover:shadow-sm"
                            >
                              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                {(c.coverImage || c.previewImages?.[0]) ? (
                                  <img
                                    src={getImageUrl(c.coverImage || c.previewImages[0])}
                                    alt={c.name}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No image</div>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover/card:text-burgundy transition-colors">{c.name}</p>
                                <p className="text-xs text-gray-500">{c.itemsCount || 0} items</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-sm text-gray-500">No collections yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column (remove seller badges and shop policies) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-bold text-gray-900 mb-4">About the Seller</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{seller.bio || '—'}</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Member since</span>
                  <span className="text-xs font-bold text-gray-900">{formatDate(seller.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Products</span>
                  <span className="text-xs font-bold text-gray-900">{seller.totalProducts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Followers</span>
                  <span className="text-xs font-bold text-gray-900">{seller.followersCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SellerProfilePage;
