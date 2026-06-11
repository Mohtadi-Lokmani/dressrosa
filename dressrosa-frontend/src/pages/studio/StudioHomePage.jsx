import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import AtelierHomeHeader from '../../components/studio/home/AtelierHomeHeader';
import SetupChecklist from '../../components/studio/home/SetupChecklist';
import TodoList from '../../components/studio/home/TodoList';
import RecentProductsStrip from '../../components/studio/home/RecentProductsStrip';
import toast from 'react-hot-toast';

/**
 * StudioHomePage — The first page a seller sees when entering The Studio.
 * Shows the seller's atelier profile (like their public storefront),
 * an onboarding checklist, a dynamic to-do list, and recent products.
 */
const StudioHomePage = () => {
  const { user } = useAuthStore();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [todoItems, setTodoItems] = useState([]);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTodo, setLoadingTodo] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      fetchSellerProfile();
      fetchRecentProducts();
      fetchTodoData();

      const interval = setInterval(fetchTodoData, 5000); // Poll every 5s for real-time updates
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  const fetchSellerProfile = async () => {
    try {
      setLoadingSeller(true);
      // Use getMyProfile which returns enriched seller data
      const data = await userService.getMyProfile();
      setSeller(data);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      // Fall back to auth store user data
      setSeller(user);
    } finally {
      setLoadingSeller(false);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      setLoadingProducts(true);
      const result = await productService.getBySeller(user.userId, { page: 0, size: 6 });
      const items = result?.content || result || [];
      setProducts(items.slice(0, 6));
    } catch (error) {
      console.error('Error fetching seller products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchTodoData = async () => {
    try {
      setLoadingTodo(true);
      // Use existing seller dashboard data as todo source
      const [dashboardRes, todoRes] = await Promise.all([
        userService.getSellerDashboard(),
        userService.getStudioTodo()
      ]);
      setStats(dashboardRes);
      setTodoItems(todoRes.items || []);
    } catch (error) {
      console.error('Error fetching todo data:', error);
      // Show empty todo (not an error-state for the user)
      setTodoItems([]);
    } finally {
      setLoadingTodo(false);
    }
  };

  const handleEditCover = () => {
    // Navigate to profile edit, scroll to cover section
    window.location.href = '/studio/profile/edit?section=cover';
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* 1. Atelier Profile Header */}
        {loadingSeller ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="h-52 bg-gray-100" />
            <div className="px-8 pb-6 pt-4">
              <div className="w-24 h-24 -mt-10 rounded-full bg-gray-200 mb-4" />
              <div className="h-6 bg-gray-100 rounded-lg w-48 mb-2" />
              <div className="h-4 bg-gray-50 rounded-lg w-72" />
            </div>
          </div>
        ) : (
          <AtelierHomeHeader seller={seller} onEditCover={handleEditCover} />
        )}

        {/* Growth/Boost Banner */}
        <div 
          onClick={() => window.location.href = '/studio/boost'}
          className="bg-gradient-to-r from-gray-900 to-burgundy-dark rounded-3xl p-6 text-white flex items-center justify-between cursor-pointer group hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Boost Your Growth</h3>
              <p className="text-burgundy-light text-sm opacity-80">Drive more visits to your Atelier with featured products</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 font-bold text-sm bg-white/10 px-4 py-2 rounded-xl group-hover:bg-white group-hover:text-gray-900 transition-all">
            <span>Get Started</span>
            <span>→</span>
          </div>
        </div>

        {/* 2 & 3. Two-column layout for Checklist + Todo */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Setup Checklist (wider) */}
          <div className="lg:col-span-3">
            <SetupChecklist seller={seller} />
          </div>

          {/* To-Do List (narrower) */}
          <div className="lg:col-span-2">
            <TodoList items={todoItems} loading={loadingTodo} />
          </div>
        </div>

        {/* 4. Recent Products Strip */}
        <RecentProductsStrip products={products} loading={loadingProducts} />
      </div>
    </div>
  );
};

export default StudioHomePage;
