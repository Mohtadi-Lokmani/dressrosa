import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Tag, ArrowRight, Star } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const HomeAside = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Mock suggested sellers for demonstration
  const suggestedSellers = [
    { id: 1, name: 'Heritage Gold', city: 'Kairouan', follows: 1240, rating: 4.9 },
    { id: 2, name: 'Zitouna Couture', city: 'Tunis', follows: 850, rating: 4.7 },
  ];

  return (
    <div className="space-y-6">
      {/* Suggested Ateliers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-burgundy" />
            <span>Suggested Ateliers</span>
          </h3>
          <Link to="/shop" className="text-xs font-semibold text-burgundy hover:underline">
            See All
          </Link>
        </div>
        <div className="p-5 space-y-4">
          {suggestedSellers.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar name={seller.name} size="md" className="ring-2 ring-burgundy/10" />
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {seller.name}
                  </p>
                  <p className="text-xs text-gray-500">{seller.city}</p>
                </div>
              </div>
              <button className="text-xs font-bold text-burgundy bg-burgundy/5 py-1.5 px-3 rounded-full hover:bg-burgundy hover:text-white transition-all">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <Tag className="w-5 h-5 text-gray-700" />
            <span>Top Categories</span>
          </h3>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/shop?cat=${cat.categoryId}`}
                className="px-3 py-1.5 bg-gray-50 hover:bg-burgundy/5 text-gray-600 hover:text-burgundy border border-gray-200 hover:border-burgundy/20 rounded-lg text-xs font-medium transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Promotions/Info Card */}
      <div className="bg-gradient-to-br from-burgundy to-burgundy-dark rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-2">Join the Atelier</h3>
          <p className="text-xs text-white/80 leading-relaxed mb-4">
            Connect with local artisans and find unique, handcrafted pieces made just for you.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-white text-burgundy px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
          >
            <span>Explore Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-burgundy-light/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default HomeAside;
