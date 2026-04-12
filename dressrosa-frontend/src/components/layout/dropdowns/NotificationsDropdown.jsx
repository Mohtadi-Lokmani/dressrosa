import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Heart, ShoppingBag, UserPlus, MessageCircle, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../../services/notificationService';
import { formatRelativeTime } from '../../../utils/formatters';

const ICON_MAP = {
  LIKE: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  ORDER: { icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
  FOLLOW: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
  MESSAGE: { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
  REVIEW: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
};

const getNotificationRoute = (type, relatedId) => {
  switch (type) {
    case 'LIKE':
    case 'REVIEW':
      return `/products/${relatedId}`;
    case 'ORDER':
      return `/orders/${relatedId}`;
    case 'FOLLOW':
      return `/profile/${relatedId}`;
    case 'MESSAGE':
      return `/messages?user=${relatedId}`;
    default:
      return '/notifications';
  }
};

const NotificationsDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getRecent();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.notificationId);
        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
          )
        );
      }
      const route = getNotificationRoute(notification.type, notification.relatedId);
      onClose();
      navigate(route);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
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
        {loading ? (
          <div className="py-12 text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              const iconConfig = ICON_MAP[notification.type] || ICON_MAP.ORDER;
              const IconComponent = iconConfig.icon;

              return (
                <div
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex space-x-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconConfig.bg} flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="ml-2 w-2 h-2 bg-burgundy rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      {notification.message && (
                        <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-center">
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-burgundy hover:text-burgundy-dark transition-colors flex items-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;