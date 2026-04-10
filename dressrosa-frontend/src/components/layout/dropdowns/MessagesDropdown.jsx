import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { messageService } from '../../../services/messageService';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import EmptyState from '../../common/EmptyState';
import { formatRelativeTime } from '../../../utils/formatters';

const MessagesDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentConversations();
  }, []);

  const fetchRecentConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data?.slice(0, 5) || []); // Show only 5 recent
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (userId) => {
    onClose();
    navigate(`/messages?user=${userId}`);
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Conversations */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading messages...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={MessageCircle}
              title="No messages"
              description="Start a conversation with sellers!"
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherUser = conversation.otherUser;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={otherUser?.userId}
                  onClick={() => handleConversationClick(otherUser?.userId)}
                  className="w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Avatar
                    src={otherUser?.profileImage}
                    name={otherUser?.userName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {otherUser?.userName}
                      </h4>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatRelativeTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p
                        className={`text-sm truncate ${
                          hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    {hasUnread && (
                      <Badge variant="primary" size="sm" className="mt-1">
                        {conversation.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <Link
            to="/messages"
            onClick={onClose}
            className="block text-center text-sm text-burgundy hover:text-burgundy-dark font-medium"
          >
            View All Messages
          </Link>
        </div>
      )}
    </div>
  );
};

export default MessagesDropdown;