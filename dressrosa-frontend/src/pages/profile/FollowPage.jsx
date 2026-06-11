import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, UserPlus, Sparkles, MoreVertical, MessageCircle, ShieldCheck, Flame } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import Container from '../../components/layout/Container';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/helpers';



const FollowPage = () => {
  const { user } = useAuthStore();
  const [connections, setConnections] = useState([]);
  const [suggestedSellers, setSuggestedSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isSeller = user?.role === 'SELLER';

  useEffect(() => {
    fetchConnections();
    fetchSuggestedSellers();
  }, [user]);

  const fetchSuggestedSellers = async () => {
    try {
      const data = await userService.getSellers({ page: 0, size: 6 });
      setSuggestedSellers(data || []);
    } catch (error) {
      console.error('Error fetching suggested sellers:', error);
    }
  };

  const fetchConnections = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let data = [];
      if (isSeller) {
        data = await socialService.getFollowers(user.userId);
        // Map data to standardize the object shape for rendering
        data = data.map(f => f.follower || f);
      } else {
        data = await socialService.getMyFollowing();
        data = data.map(f => f.following || f);
      }
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId) => {
    if (isSeller) {
      // In this mockup, SELLER might see followers and follow them back or remove.
      // We'll just show a toast for mockup purposes.
      toast.success('Action triggered');
    } else {
      try {
        await socialService.unfollowSeller(userId);
        setConnections(prev => prev.filter(c => c.userId !== userId));
        toast.success('Unfollowed successfully');
      } catch (error) {
        toast.error('Failed to unfollow');
      }
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading connections..." />;
  }

  const filteredConnections = connections.filter(c => 
    c.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Container className="py-8 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Connections</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage your {isSeller ? 'followers' : 'following'} and discover ateliers you follow.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <UserPlus className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-bold text-gray-700">Find People</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-burgundy border border-burgundy rounded-xl hover:bg-burgundy-dark transition-colors shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">Suggested Sellers</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
          
          {/* Main Content Area */}
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${isSeller ? 'followers' : 'following'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-burgundy/30 focus:ring-2 focus:ring-burgundy/10 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:border-burgundy/30 cursor-pointer shadow-sm">
                    <option>Latest</option>
                    <option>Oldest</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
                  <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {filteredConnections.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 font-medium">No {isSeller ? 'followers' : 'following'} found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredConnections.map((conn, idx) => (
                    <div key={conn.userId || idx} className="p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50/50 transition-colors gap-6 sm:gap-0">
                      
                      <div className="flex items-center space-x-4 w-full sm:w-auto">
                        <div className="relative">
                          <Avatar
                            src={conn.profilePhoto || conn.profileImage}
                            name={conn.userName}
                            size="lg"
                            className="border-2 border-white shadow-sm"
                          />
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-[15px] font-black text-gray-900">{conn.userName || 'User Name'}</h3>
                            {conn.verificationBadge && (
                              <ShieldCheck className="w-4 h-4 text-burgundy" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {conn.bio ? (conn.bio.length > 30 ? conn.bio.substring(0,30) + '...' : conn.bio) : 'Fashion Enthusiast'} • {conn.location || 'Tunis'}
                          </p>
                          <div className="flex items-center space-x-3 mt-1.5">
                            <span className="text-[11px] font-bold text-gray-700">{conn.followersCount || Math.floor(Math.random() * 1000)} followers</span>
                            <span className="text-[11px] font-bold text-gray-700">•</span>
                            <span className="text-[11px] font-bold text-gray-700">{conn.productsCount || Math.floor(Math.random() * 100)} products</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {conn.verificationBadge && (
                              <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-100">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified Seller</span>
                              </span>
                            )}
                            {idx % 2 === 1 && (
                              <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-100">
                                <Flame className="w-3 h-3" />
                                <span>Trending</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mocked Followed By */}
                      <div className="hidden md:flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Followed by</span>
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/150?img=${i + idx * 5}`} alt="User" className="w-6 h-6 rounded-full border-2 border-white" />
                          ))}
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-500">
                            +{Math.floor(Math.random() * 10) + 1}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        <div className="flex flex-col space-y-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleAction(conn.userId)}
                            className="px-6 py-2 border border-burgundy text-burgundy hover:bg-burgundy/5 rounded-xl text-xs font-bold transition-colors shadow-sm w-full sm:w-auto"
                          >
                            {isSeller ? 'Follow Back' : 'Following'}
                          </button>
                          <button className="px-6 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-1.5 w-full sm:w-auto">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Message</span>
                          </button>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {filteredConnections.length > 0 && (
              <div className="flex justify-center mt-6">
                <button className="px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm text-sm font-bold text-burgundy hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <span>Load More</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-[#FAFAFA] rounded-[2rem] border border-gray-100 p-8 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 tracking-tight mb-8">Suggested for you</h2>
              
              <div className="space-y-6">
                {suggestedSellers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No suggestions available</p>
                ) : (
                  suggestedSellers
                    .filter(s => s.userId !== user?.userId)
                    .slice(0, 5)
                    .map(seller => (
                      <div key={seller.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {seller.profilePhoto ? (
                              <img
                                src={getImageUrl(seller.profilePhoto)}
                                alt={seller.userName}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center border border-gray-200">
                                <span className="text-lg font-black text-burgundy">{seller.userName?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <h4 className="text-[13px] font-black text-gray-900">{seller.userName}</h4>
                              {seller.verificationBadge && <ShieldCheck className="w-3.5 h-3.5 text-burgundy" />}
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">{seller.bio ? seller.bio.slice(0, 28) + (seller.bio.length > 28 ? '…' : '') : 'Fashion Atelier'}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{seller.followersCount || 0} followers</p>
                          </div>
                        </div>
                        <Link
                          to={`/seller/${seller.userId}`}
                          className="px-4 py-1.5 bg-burgundy text-white rounded-xl text-[11px] font-bold shadow-md shadow-burgundy/20 hover:bg-burgundy-dark transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    ))
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-200/50 flex justify-center">
                <button className="text-xs font-bold text-burgundy hover:text-burgundy-dark transition-colors flex items-center space-x-1">
                  <span>View More Suggestions</span>
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default FollowPage;