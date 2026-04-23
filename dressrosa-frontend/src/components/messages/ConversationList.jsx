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
    <div className="flex flex-col h-full bg-[#FCFBFA] border-r border-gray-100">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-3xl font-serif font-bold text-burgundy mb-6 leading-tight">Correspondence</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archives..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy/20 transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner-sm mx-auto mb-3"></div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Loading...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-400">
              {searchQuery ? 'No archives found' : 'No correspondence yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.otherUser;
              const isSelected = selectedUserId === otherUser?.userId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={otherUser?.userId}
                  onClick={() => onSelectConversation(otherUser?.userId)}
                  className={`w-full px-4 py-5 flex items-center space-x-4 transition-all duration-300 rounded-2xl group relative ${
                    isSelected ? 'bg-burgundy/[0.03]' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Left Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-burgundy rounded-r-full shadow-[2px_0_10px_rgba(128,0,32,0.3)] animate-fade-in" />
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={otherUser?.profileImage}
                      name={otherUser?.userName}
                      size="lg"
                      className={`ring-2 ring-offset-2 transition-all duration-300 ${
                        isSelected ? 'ring-burgundy/20 scale-105' : 'ring-transparent'
                      }`}
                    />
                    {otherUser?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-base truncate transition-colors ${
                          isSelected ? 'font-bold text-burgundy' : hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                        }`}
                      >
                        {otherUser?.userName}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-2 flex-shrink-0">
                          {formatRelativeTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>

                    {/* Last Message */}
                    {conversation.lastMessage && (
                      <p
                        className={`text-sm truncate leading-snug transition-all ${
                          isSelected 
                            ? 'font-serif italic text-burgundy/70' 
                            : hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread Indicator */}
                  {!isSelected && hasUnread && (
                    <div className="w-2.5 h-2.5 bg-burgundy rounded-full shadow-[0_0_8px_rgba(128,0,32,0.4)] flex-shrink-0 ml-2" />
                  )}
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