import { Bell, X, Heart, ShoppingBag, UserPlus, MessageCircle, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../../utils/formatters';

const NotificationsDropdown = ({ onClose }) => {
  // Mock data - will come from notifications store later
  const notifications = [
    {
      id: 1,
      type: 'LIKE',
      title: 'Scar tn liked your product',
      message: 'Black T-Shirt with Design',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      icon: Heart,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
    },
    {
      id: 2,
      type: 'ORDER',
      title: 'New order received',
      message: 'Order #1234 - $129.97',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      icon: ShoppingBag,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
    },
    {
      id: 3,
      type: 'FOLLOW',
      title: 'Fashion Store started following you',
      message: '',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      icon: UserPlus,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
    },
    {
      id: 4,
      type: 'MESSAGE',
      title: 'New message from Style Shop',
      message: 'Thank you for your purchase!',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      icon: MessageCircle,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
    },
    {
      id: 5,
      type: 'REVIEW',
      title: 'New review on your product',
      message: '⭐⭐⭐⭐⭐ "Amazing quality!"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      icon: Star,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-50',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    // Will call notification service later
    console.log('Mark all as read');
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-burgundy" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-burgundy rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex space-x-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center`}>
                    <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="ml-2 w-2 h-2 bg-burgundy rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm font-medium text-burgundy hover:text-burgundy-dark transition-colors flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
            <Link
              to="/notifications"
              onClick={onClose}
              className="text-sm font-medium text-burgundy hover:text-burgundy-dark transition-colors ml-auto"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;