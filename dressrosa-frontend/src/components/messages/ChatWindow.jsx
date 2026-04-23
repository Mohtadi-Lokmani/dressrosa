import { useEffect, useRef } from 'react';
import { Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { useAuthStore } from '../../store/authStore';

const ChatWindow = ({ otherUser, messages, loading, messagesEndRef, onBack }) => {
  const { user } = useAuthStore();
  const scrollContainerRef = useRef(null);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.sentAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50 flex-shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-5">
          {/* Back Button (Mobile) */}
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <Link to={`/profile/${otherUser?.userId}`} className="flex items-center space-x-4 group">
            <div className="relative">
              <Avatar
                src={otherUser?.profileImage}
                name={otherUser?.userName}
                size="md"
                className="ring-2 ring-burgundy/10 group-hover:ring-burgundy/30 transition-all"
              />
              {otherUser?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div>
              <h3 className="font-serif font-black text-gray-900 text-lg tracking-tight group-hover:text-burgundy transition-colors">
                {otherUser?.userName}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] animate-pulse">
                  {otherUser?.isOnline ? 'Active in Studio' : 'Away from Studio'}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-3 text-gray-400 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-all">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar flex flex-col"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="spinner-sm mx-auto mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Retrieving Messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">New Connection</p>
              <p className="text-xs font-serif italic text-gray-400">
                Start a new chapter of correspondence with {otherUser?.userName}.
              </p>
            </div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} className="flex flex-col space-y-8">
                {/* Date Separator */}
                <div className="flex items-center justify-center">
                  <span className="px-5 py-1.5 bg-[#F9F8F6] border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="flex flex-col space-y-12">
                  {msgs.map((message, index) => {
                    const isOwn = message.senderId === user?.userId;
                    const showAvatar = !isOwn && (
                      index === msgs.length - 1 ||
                      msgs[index + 1]?.senderId !== message.senderId
                    );

                    return (
                      <div
                        key={message.messageId}
                        className={`flex items-end max-w-[85%] lg:max-w-[75%] ${
                          isOwn ? 'self-end flex-row-reverse space-x-reverse' : 'self-start space-x-4'
                        }`}
                      >
                        {/* Avatar for other user */}
                        {!isOwn && (
                          <div className="flex-shrink-0 w-8 mb-1">
                            {showAvatar && (
                              <Link to={`/profile/${otherUser?.userId}`}>
                                <Avatar
                                  src={message.senderPhoto}
                                  name={message.senderName}
                                  size="sm"
                                  className="ring-1 ring-gray-100"
                                />
                              </Link>
                            )}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`flex flex-col group relative ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-6 py-4 rounded-[2.5rem] shadow-sm relative transition-all duration-300 hover:shadow-md ${
                              isOwn
                                ? 'bg-burgundy text-white rounded-br-lg'
                                : 'bg-[#F2F2F2] text-gray-950 rounded-bl-lg'
                            }`}
                          >
                            {/* Attachment (Image) Support */}
                            {message.attachmentUrl && (
                              <div className="mb-3 rounded-3xl overflow-hidden border border-white/10 shadow-lg cursor-pointer">
                                <img 
                                  src={message.attachmentUrl} 
                                  alt="Correspondence attachment" 
                                  className="max-w-full h-auto object-cover max-h-96 hover:scale-105 transition-transform duration-500" 
                                />
                              </div>
                            )}
                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          
                          {/* Message Metadata (Time) */}
                          <div className={`mt-2 flex items-center space-x-1.5 ${isOwn ? 'mr-2' : 'ml-2'}`}>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                              {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            {isOwn && (
                              <div className="w-1 h-1 bg-burgundy/30 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;