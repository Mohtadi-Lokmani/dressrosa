import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { userService } from '../../services/userService';
import { useMessages } from '../../hooks/useMessages';
import Container from '../../components/layout/Container';
import ConversationList from '../../components/messages/ConversationList';
import ChatWindow from '../../components/messages/ChatWindow';
import MessageInput from '../../components/messages/MessageInput';
import EmptyState from '../../components/common/EmptyState';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false); // For mobile view

  // Get messages for selected conversation
  const {
    messages,
    loading: loadingMessages,
    sending,
    sendMessage,
    messagesEndRef,
  } = useMessages(selectedUserId, {
    pollingInterval: 3000,
    autoScroll: true,
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
  }, [searchParams, conversations]); // Added conversations to dependencies

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await messageService.getConversations();
      // Normalize data to match frontend expectations (nested otherUser object)
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
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (userId) => {
    setSelectedUserId(userId);
    
    // Find user info from conversations
    const conversation = conversations.find(
      (conv) => conv.otherUser?.userId === userId
    );
    
    if (conversation) {
      setSelectedUser(conversation.otherUser);
    } else {
      // If conversation is new, fetch user profile
      try {
        const userData = await userService.getUserById(userId);
        // Normalize user data to match ChatWindow expectations
        setSelectedUser({
          ...userData,
          userId: userData.userId,
          userName: userData.userName,
          profileImage: userData.profilePhoto // Map profilePhoto to profileImage
        });
      } catch (error) {
        console.error('Error fetching user for new conversation:', error);
        toast.error('Failed to load user profile');
      }
    }

    // Update URL
    setSearchParams({ user: userId });
    
    // Show chat on mobile
    setShowChat(true);
  };

  const handleSendMessage = async (content) => {
    try {
      await sendMessage(content);
      // Refresh conversations to update last message
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
    <div className="bg-[#FAF9F6] flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List - Desktop: Fixed width, Mobile: Full width */}
        <div
          className={`w-full lg:w-[380px] lg:min-w-[380px] flex-shrink-0 ${
            showChat ? 'hidden lg:flex' : 'flex'
          } flex-col border-r border-gray-100 bg-[#FCFBFA] shadow-sm z-10`}
        >
          <ConversationList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            loading={loadingConversations}
          />
        </div>

        {/* Chat Area - Desktop: Flexible, Mobile: Full width */}
        <div
          className={`flex-1 ${
            !showChat ? 'hidden lg:flex' : 'flex'
          } flex-col bg-white relative`}
        >
          {selectedUserId && selectedUser ? (
            <>
              <ChatWindow
                otherUser={selectedUser}
                messages={messages}
                loading={loadingMessages}
                messagesEndRef={messagesEndRef}
                onBack={handleBackToList}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                sending={sending}
                disabled={false}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#FCFBFA]">
              <div className="text-center max-w-sm px-6">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-burgundy/20" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Correspondence</h3>
                <p className="text-sm text-gray-400 leading-relaxed italic">
                  Select a record from your archives to continue the conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;