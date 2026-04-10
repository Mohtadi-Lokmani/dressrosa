import { Search } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { useState } from 'react';

const ConversationList = ({ conversations, selectedUserId, onSelectConversation, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.otherUser;
    const userName = otherUser?.userName?.toLowerCase() || '';
    const lastMessage = conv.lastMessage?.content?.toLowerCase() || '';
    const query = debouncedSearch.toLowerCase();
    
    return userName.includes(query) || lastMessage.includes(query);
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.otherUser;
              const isSelected = selectedUserId === otherUser?.userId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={otherUser?.userId}
                  onClick={() => onSelectConversation(otherUser?.userId)}
                  className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-burgundy/5 border-r-4 border-burgundy' : ''
                  }`}
                >
                  {/* Avatar */}
                  <Avatar
                    src={otherUser?.profileImage}
                    name={otherUser?.userName}
                    size="lg"
                    status={otherUser?.isOnline ? 'online' : 'offline'}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-semibold truncate ${
                          hasUnread ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {otherUser?.userName}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatRelativeTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>

                    {/* Last Message */}
                    {conversation.lastMessage && (
                      <p
                        className={`text-sm truncate ${
                          hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {conversation.lastMessage.content}
                      </p>
                    )}

                    {/* Unread Badge */}
                    {hasUnread && (
                      <div className="mt-2">
                        <Badge variant="primary" size="sm">
                          {conversation.unreadCount} new
                        </Badge>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;