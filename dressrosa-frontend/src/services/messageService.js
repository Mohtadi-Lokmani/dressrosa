import api from './api';
import { ENDPOINTS } from '../config/api.config';

export const messageService = {
  // Send a message to a user
  sendMessage: async (receiverId, content) => {
    const response = await api.post(ENDPOINTS.MESSAGES.SEND, {
      receiverId,
      content,
    });
    return response.data;
  },

  // Get conversation with a specific user
  getConversation: async (userId, params = {}) => {
    const { page = 0, size = 50, sort = 'sentAt,desc' } = params;
    const response = await api.get(
      ENDPOINTS.MESSAGES.CONVERSATION(userId),
      {
        params: { page, size, sort },
      }
    );
    return response.data;
  },

  // Get all conversations
  getConversations: async (params = {}) => {
    const { page = 0, size = 50 } = params;
    const response = await api.get(ENDPOINTS.MESSAGES.CONVERSATIONS, {
      params: { page, size },
    });
    return response.data;
  },

  // Mark a message as read
  markAsRead: async (messageId) => {
    const response = await api.put(
      ENDPOINTS.MESSAGES.MARK_READ(messageId)
    );
    return response.data;
  },

  // Mark entire conversation as read
  markConversationAsRead: async (userId) => {
    const response = await api.put(
      ENDPOINTS.MESSAGES.MARK_CONVERSATION_READ(userId)
    );
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get(ENDPOINTS.MESSAGES.UNREAD_COUNT);
    return response.data;
  },

  // Get unread messages
  getUnreadMessages: async () => {
    const response = await api.get(ENDPOINTS.MESSAGES.UNREAD);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(
      ENDPOINTS.MESSAGES.DELETE(messageId)
    );
    return response.data;
  },
};

export default messageService;