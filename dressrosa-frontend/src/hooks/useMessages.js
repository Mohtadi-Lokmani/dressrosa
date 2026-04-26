import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';

export const useMessages = (conversationUserId, options = {}) => {
  const {
    pollingInterval = 3000, // Poll every 3 seconds
    autoScroll = true,
    merchantId = null,
  } = options;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pollingRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum = 0, append = false) => {
    if (!conversationUserId) return;

    try {
      setLoading(pageNum === 0);
      const response = await messageService.getConversation(conversationUserId, {
        page: pageNum,
        size: 50,
        sort: 'sentAt,desc',
      });

      const newMessages = response.content || [];
      
      if (append) {
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        setMessages(newMessages.reverse()); // Reverse to show oldest first
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationUserId]);

  // Send message
  const sendMessage = useCallback(async (content) => {
    if (!conversationUserId || !content.trim()) return;

    try {
      setSending(true);
      const newMessage = await messageService.sendMessage(conversationUserId, content.trim(), merchantId);
      
      // Add message to list immediately
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom
      if (autoScroll && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [conversationUserId, autoScroll]);

  // Mark as read
  const markAsRead = useCallback(async () => {
    if (!conversationUserId) return;

    try {
      await messageService.markConversationAsRead(conversationUserId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationUserId]);

  // Load more messages
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchMessages(page + 1, true);
    }
  }, [hasMore, loading, page, fetchMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (conversationUserId) {
      fetchMessages(0);
      markAsRead();
    }
  }, [conversationUserId]);

  // Polling for new messages
  useEffect(() => {
    if (!conversationUserId || pollingInterval <= 0) return;

    pollingRef.current = setInterval(() => {
      fetchMessages(0);
      markAsRead();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [conversationUserId, pollingInterval, fetchMessages, markAsRead]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, autoScroll, scrollToBottom]);

  return {
    messages,
    loading,
    sending,
    hasMore,
    sendMessage,
    loadMore,
    scrollToBottom,
    messagesEndRef,
    refresh: () => fetchMessages(0),
  };
};

export default useMessages;