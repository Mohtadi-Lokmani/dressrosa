import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../../services/messageService';
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
  }, [searchParams]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await messageService.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    
    // Find user info from conversations
    const conversation = conversations.find(
      (conv) => conv.otherUser?.userId === userId
    );
    
    if (conversation) {
      setSelectedUser(conversation.otherUser);
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
    <div className="h-screen bg-gray-50 flex flex-col">
      <Container className="flex-1 flex flex-col py-6 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex">
          {/* Conversations List - Desktop: Always visible, Mobile: Hide when chat open */}
          <div
            className={`w-full lg:w-80 flex-shrink-0 ${
              showChat ? 'hidden lg:flex' : 'flex'
            } flex-col`}
          >
            <ConversationList
              conversations={conversations}
              selectedUserId={selectedUserId}
              onSelectConversation={handleSelectConversation}
              loading={loadingConversations}
            />
          </div>

          {/* Chat Area - Desktop: Always visible, Mobile: Show when conversation selected */}
          <div
            className={`flex-1 ${
              !showChat ? 'hidden lg:flex' : 'flex'
            } flex-col`}
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
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <EmptyState
                  icon={MessageCircle}
                  title="Select a conversation"
                  description="Choose a conversation from the list to start messaging"
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MessagesPage;