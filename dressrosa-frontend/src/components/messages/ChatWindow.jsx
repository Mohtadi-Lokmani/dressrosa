import { useEffect, useRef } from 'react';
import { MoreVertical, ArrowLeft } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';

const ChatWindow = ({ otherUser, messages, loading, messagesEndRef, onBack }) => {
  const { user } = useAuthStore();
  const scrollContainerRef = useRef(null);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.sentAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Back Button (Mobile) */}
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <Avatar
            src={otherUser?.profileImage}
            name={otherUser?.userName}
            size="md"
            status={otherUser?.isOnline ? 'online' : 'offline'}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser?.userName}</h3>
            <p className="text-sm text-gray-500">
              {otherUser?.isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">
                Start the conversation by sending a message!
              </p>
            </div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-4 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Messages for this date */}
                {msgs.map((message, index) => {
                  const isOwn = message.sender?.userId === user?.userId;
                  const showAvatar = !isOwn && (
                    index === msgs.length - 1 ||
                    msgs[index + 1]?.sender?.userId !== message.sender?.userId
                  );

                  return (
                    <div
                      key={message.messageId}
                      className={`flex items-end space-x-2 ${
                        isOwn ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      {!isOwn && (
                        <div className="flex-shrink-0 w-8">
                          {showAvatar ? (
                            <Avatar
                              src={message.sender?.profileImage}
                              name={message.sender?.userName}
                              size="sm"
                            />
                          ) : (
                            <div className="w-8"></div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-burgundy text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-burgundy-light' : 'text-gray-500'
                          }`}
                        >
                          {formatRelativeTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;