import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ShoppingBag, 
  UserPlus, 
  MessageSquare, 
  Star, 
  Check, 
  ArrowRight,
  Filter,
  Circle
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ICON_MAP = {
  LIKE: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ORDER: { icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
  FOLLOW: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
  MESSAGE: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
  REVIEW: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
};

const getStudioNotificationRoute = (type, relatedId) => {
  switch (type) {
    case 'ORDER':
      return '/studio/orders'; // In real app, /studio/orders/${relatedId}
    case 'MESSAGE':
      return `/studio/messages?user=${relatedId}`;
    case 'REVIEW':
      return '/studio/reviews';
    default:
      return '/studio';
  }
};

const StudioNotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { audience: 'SELLER' };
      const data = filter === 'UNREAD' 
        ? await notificationService.getUnread(params)
        : await notificationService.getAll(params);
      
      setNotifications(data.content || []);
    } catch (error) {
      console.error('Error fetching studio notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(); // TODO: Add audience support to marking all as read if backend supports it
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Allocated notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.notificationId);
    }
    const route = getStudioNotificationRoute(notification.type, notification.relatedId);
    navigate(route);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Studio Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with your business performance and customer interactions.</p>
        </div>
        
        <button 
          onClick={handleMarkAllRead}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'ALL' 
            ? 'bg-gray-900 text-white' 
            : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
          }`}
        >
          All Notifications
        </button>
        <button 
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'UNREAD' 
            ? 'bg-gray-900 text-white' 
            : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm italic">Synchronising records...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-300">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">All clear!</h3>
            <p className="text-gray-500 text-sm mt-2">You don't have any {filter === 'UNREAD' ? 'unread ' : ''}notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => {
              const config = ICON_MAP[notification.type] || ICON_MAP.ORDER;
              const Icon = config.icon;
              
              return (
                <div 
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group p-6 flex items-start space-x-4 hover:bg-gray-50 transition-all cursor-pointer relative ${
                    !notification.isRead ? 'bg-blue-50/10' : ''
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-full"></div>
                  )}

                  <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`text-sm font-bold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 whitespace-nowrap ml-4">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioNotificationsPage;
