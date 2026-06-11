import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, AlertCircle, Star, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';

/**
 * TodoList
 * Shows dynamic pending-action items that need the seller's attention.
 * Each item comes from the parent with a count and action link.
 */
const TYPE_CONFIG = {
  ORDER: { icon: ShoppingBag, color: 'bg-orange-50 text-orange-500' },
  MESSAGE: { icon: MessageCircle, color: 'bg-blue-50 text-blue-500' },
  STOCK: { icon: AlertCircle, color: 'bg-red-50 text-red-500' },
  REVIEW: { icon: Star, color: 'bg-yellow-50 text-yellow-500' },
  BOOST: { icon: Zap, color: 'bg-purple-50 text-purple-500' },
};

const TodoList = ({ items = [], loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">To-do list</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasItems = items && items.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 text-base">To-do list</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {hasItems
            ? 'Check unread messages, orders, and other things that need your attention.'
            : "You're all caught up!"}
        </p>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {!hasItems ? (
          <div className="px-6 py-8 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <p className="font-bold text-gray-700 text-sm mb-1">All caught up! 🎉</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              No pending actions. Keep up the great work!
            </p>
          </div>
        ) : (
          items.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.ORDER;
            return (
              <Link
                key={item.id}
                to={item.actionLink || item.actionUrl}
                className="flex items-center space-x-4 px-6 py-4 hover:bg-gray-50/80 transition-colors group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <config.icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-burgundy transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-burgundy group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodoList;
