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
        message.setIsRead(false);  
        message.setSeenAt(null);   
        
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
    
    
    public List<ConversationResponse> getConversations(Long userId) {
        // Get all unique users this user has chatted with
      
        
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
        
        
        // webSocketService.sendReadReceipt(message.getSender().getUserId(), messageId);
    }
   
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
    
  
    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverUserIdAndIsReadFalse(userId);
    }
    
   
    public List<MessageResponse> getUnreadMessages(Long userId) {
        List<Message> messages = messageRepository.getUnreadMessages(userId);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
   
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