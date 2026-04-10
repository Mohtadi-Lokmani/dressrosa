package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.social.ConversationResponse;
import com.dressrosa.dressrosa_backend.dto.social.MessageRequest;
import com.dressrosa.dressrosa_backend.dto.social.MessageResponse;
import com.dressrosa.dressrosa_backend.model.Message;
import com.dressrosa.dressrosa_backend.model.NotificationType;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.repository.MessageRepository;
import com.dressrosa.dressrosa_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * SEND MESSAGE
     * 
     * What it does:
     * 1. Validate sender and receiver exist
     * 2. Create message with content
     * 3. Set isRead = false, seenAt = null
     * 4. Save to database
     * 5. Send notification to receiver
     * 6. Return message details
     * 
     * Real-time note: In production, you'd also emit WebSocket event
     * so receiver gets message instantly without refreshing
     * 
     * @param request - Contains receiverId and message content
     * @param senderId - Current user (from JWT token)
     * @return MessageResponse with sent message
     * @throws RuntimeException if users not found
     */
    @Transactional
    public MessageResponse sendMessage(MessageRequest request, Long senderId) {
        // Can't send message to yourself
        if (senderId.equals(request.getReceiverId())) {
            throw new RuntimeException("Cannot send message to yourself");
        }
        
        // Find users
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        // Create message
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setIsRead(false);  // Not read yet
        message.setSeenAt(null);   // Not seen yet
        
        Message savedMessage = messageRepository.save(message);
        
        // Send notification to receiver
        notificationService.createNotification(
            receiver.getUserId(),
            NotificationType.MESSAGE,
            "New Message",
            "You have a new message from " + sender.getUserName(),
            savedMessage.getMessageId()
        );
        
        // TODO: In real app, emit WebSocket event here:
        // webSocketService.sendToUser(receiver.getUserId(), savedMessage);
        
        return convertToResponse(savedMessage);
    }
    
    /**
     * GET CONVERSATION BETWEEN TWO USERS
     * 
     * What it does:
     * - Fetch all messages exchanged between two users
     * - Sorted chronologically (oldest first for chat display)
     * - Includes messages in both directions:
     *   * User A → User B
     *   * User B → User A
     * - Paginated (load more messages as user scrolls up)
     * 
     * @param otherUserId - The other person in conversation
     * @param currentUserId - Current user
     * @param pageable - Pagination settings
     * @return Page of messages
     */
    public Page<MessageResponse> getConversation(
            Long otherUserId, 
            Long currentUserId, 
            Pageable pageable) {
        
        Page<Message> messages = messageRepository.getConversation(
            currentUserId, 
            otherUserId, 
            pageable
        );
        
        return messages.map(this::convertToResponse);
    }
    
    /**
     * GET ALL CONVERSATIONS FOR USER
     * 
     * What it does:
     * - Get list of all people user has chatted with
     * - Show last message preview
     * - Show unread count for each conversation
     * - Sorted by most recent activity first
     * - Like WhatsApp/Messenger conversation list
     * 
     * Example output:
     * [
     *   { user: "Sarah", lastMsg: "Thanks!", time: "2 min ago", unread: 3 },
     *   { user: "Mike", lastMsg: "Is it available?", time: "1 hour ago", unread: 0 }
     * ]
     * 
     * @param userId - Current user
     * @return List of conversations with previews
     */
    public List<ConversationResponse> getConversations(Long userId) {
        // Get all unique users this user has chatted with
        // This is simplified - in production you'd use a more efficient query
        
        List<Message> sentMessages = messageRepository.findBySenderUserId(userId);
        List<Message> receivedMessages = messageRepository.findByReceiverUserId(userId);
        
        // Collect unique conversation partners
        Set<Long> conversationPartners = new HashSet<>();
        sentMessages.forEach(m -> conversationPartners.add(m.getReceiver().getUserId()));
        receivedMessages.forEach(m -> conversationPartners.add(m.getSender().getUserId()));
        
        // Build conversation preview for each partner
        List<ConversationResponse> conversations = new ArrayList<>();
        
        for (Long partnerId : conversationPartners) {
            User partner = userRepository.findById(partnerId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get last message with this partner
            Message lastMessage = messageRepository.getLastMessage(userId, partnerId);
            
            // Count unread messages from this partner
            Long unreadCount = messageRepository.findByReceiverUserId(userId).stream()
                    .filter(m -> m.getSender().getUserId().equals(partnerId))
                    .filter(m -> !m.getIsRead())
                    .count();
            
            ConversationResponse conv = new ConversationResponse();
            conv.setOtherUserId(partnerId);
            conv.setOtherUserName(partner.getUserName());
            conv.setOtherUserPhoto(partner.getProfilePhoto());
            
            if (lastMessage != null) {
                conv.setLastMessage(lastMessage.getContent());
                conv.setLastMessageTime(lastMessage.getSentAt());
                
                // Check if last message was from partner and is unread
                boolean isLastFromPartner = lastMessage.getSender().getUserId().equals(partnerId);
                conv.setIsRead(isLastFromPartner ? lastMessage.getIsRead() : true);
            }
            
            conv.setUnreadCount(unreadCount);
            
            conversations.add(conv);
        }
        
        // Sort by most recent first
        conversations.sort((a, b) -> {
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        });
        
        return conversations;
    }
    
    /**
     * MARK MESSAGE AS READ
     * 
     * What it does:
     * - Mark message as read when receiver views it
     * - Set isRead = true
     * - Set seenAt = current timestamp
     * - Used to show "Read" status and read receipts
     * - Only receiver can mark as read
     * 
     * Flow:
     * 1. Message arrives → isRead = false, seenAt = null
     * 2. User opens chat → Call this method
     * 3. isRead = true, seenAt = "2024-02-13 14:30:00"
     * 4. Sender sees "Read at 14:30" (like WhatsApp blue ticks)
     * 
     * @param messageId - Message to mark as read
     * @param userId - Current user (must be receiver)
     */
    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Only receiver can mark as read
        if (!message.getReceiver().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Don't update if already read
        if (message.getIsRead()) {
            return;
        }
        
        message.setIsRead(true);
        message.setSeenAt(LocalDateTime.now());
        messageRepository.save(message);
        
        // TODO: In real app, emit WebSocket event to sender:
        // webSocketService.sendReadReceipt(message.getSender().getUserId(), messageId);
    }
    
    /**
     * MARK ALL MESSAGES FROM USER AS READ
     * 
     * What it does:
     * - Mark entire conversation as read
     * - Called when user opens a conversation
     * - Marks all unread messages from that person
     * 
     * Example: User has 5 unread messages from Sarah
     * → User opens chat with Sarah
     * → All 5 messages marked as read
     * 
     * @param fromUserId - User who sent the messages
     * @param currentUserId - Current user (receiver)
     */
    @Transactional
    public void markConversationAsRead(Long fromUserId, Long currentUserId) {
        List<Message> unreadMessages = messageRepository.getUnreadMessages(currentUserId)
                .stream()
                .filter(m -> m.getSender().getUserId().equals(fromUserId))
                .collect(Collectors.toList());
        
        LocalDateTime now = LocalDateTime.now();
        
        for (Message message : unreadMessages) {
            message.setIsRead(true);
            message.setSeenAt(now);
            messageRepository.save(message);
        }
    }
    
    /**
     * GET UNREAD MESSAGE COUNT
     * 
     * What it does:
     * - Count total unread messages for user
     * - Used to show notification badge (like "5" on app icon)
     * 
     * @param userId - Current user
     * @return Number of unread messages
     */
    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverUserIdAndIsReadFalse(userId);
    }
    
    /**
     * GET UNREAD MESSAGES
     * 
     * What it does:
     * - Fetch all unread messages for user
     * - Sorted by newest first
     * - Used to show notifications list
     * 
     * @param userId - Current user
     * @return List of unread messages
     */
    public List<MessageResponse> getUnreadMessages(Long userId) {
        List<Message> messages = messageRepository.getUnreadMessages(userId);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * DELETE MESSAGE
     * 
     * What it does:
     * - Delete a message
     * - Only sender can delete their own messages
     * - Note: This is "delete for me" not "delete for everyone"
     *   (For "delete for everyone" you'd need soft delete flag)
     * 
     * @param messageId - Message to delete
     * @param userId - Current user
     */
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Only sender can delete
        if (!message.getSender().getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own messages");
        }
        
        messageRepository.delete(message);
    }
    
    /**
     * SEARCH MESSAGES
     * 
     * What it does:
     * - Search message content
     * - Find messages containing specific text
     * - Used for "Search in conversation" feature
     * 
     * @param userId - Current user
     * @param searchTerm - Text to search for
     * @return List of matching messages
     */
    public List<MessageResponse> searchMessages(Long userId, String searchTerm) {
        // Get all messages involving this user
        List<Message> sentMessages = messageRepository.findBySenderUserId(userId);
        List<Message> receivedMessages = messageRepository.findByReceiverUserId(userId);
        
        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(sentMessages);
        allMessages.addAll(receivedMessages);
        
        // Filter by search term (case-insensitive)
        return allMessages.stream()
                .filter(m -> m.getContent().toLowerCase()
                        .contains(searchTerm.toLowerCase()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * CONVERT MESSAGE ENTITY TO RESPONSE
     * 
     * What it does:
     * - Transform Message → MessageResponse
     * - Include sender and receiver info
     * - Include timestamps and read status
     */
    private MessageResponse convertToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        
        response.setMessageId(message.getMessageId());
        response.setContent(message.getContent());
        response.setIsRead(message.getIsRead());
        response.setSentAt(message.getSentAt());
        response.setSeenAt(message.getSeenAt());
        
        // Sender info
        User sender = message.getSender();
        response.setSenderId(sender.getUserId());
        response.setSenderName(sender.getUserName());
        response.setSenderPhoto(sender.getProfilePhoto());
        
        // Receiver info
        User receiver = message.getReceiver();
        response.setReceiverId(receiver.getUserId());
        response.setReceiverName(receiver.getUserName());
        response.setReceiverPhoto(receiver.getProfilePhoto());
        
        return response;
    }
}