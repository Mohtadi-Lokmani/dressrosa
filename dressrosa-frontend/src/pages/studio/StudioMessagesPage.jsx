import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { userService } from '../../services/userService';
import { useMessages } from '../../hooks/useMessages';
import { useAuthStore } from '../../store/authStore';
import ConversationList from '../../components/messages/ConversationList';
import ChatWindow from '../../components/messages/ChatWindow';
import MessageInput from '../../components/messages/MessageInput';
import { MessageSquare, Inbox, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const StudioMessagesPage = () => {
  const { user: currentUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Get messages for selected conversation
  // In Studio, we are always the merchant (currentUser.userId)
  const {
    messages,
    loading: loadingMessages,
    sending,
    sendMessage,
    messagesEndRef,
  } = useMessages(selectedUserId, {
    pollingInterval: 3000,
    autoScroll: true,
    merchantId: currentUser?.userId
  });

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Check URL params for conversation
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      handleSelectConversation(parseInt(userId));
    }
  }, [searchParams, conversations]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await messageService.getStudioConversations();
      // Normalize data
      const normalizedData = (data || []).map(conv => ({
        ...conv,
        otherUser: {
          userId: conv.otherUserId,
          userName: conv.otherUserName,
          profileImage: conv.otherUserPhoto
        }
      }));
      setConversations(normalizedData);
    } catch (error) {
      console.error('Error fetching studio conversations:', error);
      toast.error('Failed to load customer messages');
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (userId) => {
    setSelectedUserId(userId);
    
    const conversation = conversations.find(
      (conv) => conv.otherUser?.userId === userId
    );
    
    if (conversation) {
      setSelectedUser(conversation.otherUser);
    } else {
      try {
        const userData = await userService.getUserById(userId);
        setSelectedUser({
          ...userData,
          userId: userData.userId,
          userName: userData.userName,
          profileImage: userData.profilePhoto
        });
      } catch (error) {
        console.error('Error fetching user for studio conversation:', error);
      }
    }

    setSearchParams({ user: userId });
    setShowChat(true);
  };

  const handleSendMessage = async (content) => {
    try {
      await sendMessage(content);
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Sidebar / List */}
      <div 
        className={`w-full lg:w-[350px] border-r border-gray-100 flex flex-col flex-shrink-0 ${
          showChat ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Customer Inbox</h1>
            <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Studio
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            loading={loadingConversations}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!showChat ? 'hidden lg:flex' : 'flex'}`}>
        {selectedUserId && selectedUser ? (
          <>
            <ChatWindow
              otherUser={selectedUser}
              messages={messages}
              loading={loadingMessages}
              messagesEndRef={messagesEndRef}
              onBack={handleBackToList}
            />
            <div className="p-4 bg-white border-t border-gray-100">
              <MessageInput
                onSendMessage={handleSendMessage}
                sending={sending}
                placeholder="Type your reply to customer..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-gray-200">
              <Inbox className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your Business Inbox</h2>
            <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
              All messages from buyers about your products will appear here. Select a customer to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioMessagesPage;
