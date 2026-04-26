package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.social.ConversationResponse;
import com.dressrosa.dressrosa_backend.dto.social.MessageRequest;
import com.dressrosa.dressrosa_backend.dto.social.MessageResponse;
import com.dressrosa.dressrosa_backend.model.Message;
import com.dressrosa.dressrosa_backend.model.NotificationAudience;
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
        
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setIsRead(false);  
        message.setSeenAt(null);   

        // Set merchant context
        if (request.getMerchantId() != null) {
            User merchant = userRepository.findById(request.getMerchantId())
                    .orElseThrow(() -> new RuntimeException("Merchant not found"));
            message.setMerchant(merchant);
        } else if (receiver.getRole() == com.dressrosa.dressrosa_backend.model.Role.SELLER) {
            // Default to receiver if they are a seller and no context provided
            message.setMerchant(receiver);
        }
        
        Message savedMessage = messageRepository.save(message);
        
        // Notification logic: Determine audience
        NotificationAudience audience = NotificationAudience.BUYER;
        if (message.getMerchant() != null && message.getMerchant().getUserId().equals(receiver.getUserId())) {
            audience = NotificationAudience.SELLER;
        }

        // Send notification to receiver
        notificationService.createNotification(
            receiver.getUserId(),
            NotificationType.MESSAGE,
            audience,
            "New Message from " + sender.getUserName(),
            message.getContent().substring(0, Math.min(message.getContent().length(), 50)) + (message.getContent().length() > 50 ? "..." : ""),
            savedMessage.getMessageId()
        );

        // AUTO-REPLY LOGIC: If receiver is a seller and has an auto-reply message set
        if (receiver.getAutoReplyMessage() != null && !receiver.getAutoReplyMessage().isEmpty()) {
            // Check if this is a buyer contacting a seller
            // And ensure we don't auto-reply to an auto-reply (prevent loop)
            // For simplicity, we only auto-reply if the sender is NOT the receiver (already checked)
            // and if there are no messages from the seller to this buyer yet in this context
            
            boolean threadHasSellerResponse = messageRepository.getConversation(senderId, receiver.getUserId(), Pageable.unpaged())
                .getContent().stream()
                .anyMatch(m -> m.getSender().getUserId().equals(receiver.getUserId()));

            if (!threadHasSellerResponse) {
                Message autoReply = new Message();
                autoReply.setSender(receiver);
                autoReply.setReceiver(sender);
                autoReply.setContent("[Auto-Reply] " + receiver.getAutoReplyMessage());
                autoReply.setIsRead(false);
                autoReply.setMerchant(receiver); // Context is the seller
                messageRepository.save(autoReply);
                
                // Note: We don't send a notification for auto-replies to keep it clean
            }
        }
        
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
        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(messageRepository.findBySenderUserId(userId));
        allMessages.addAll(messageRepository.findByReceiverUserId(userId));
        return buildConversations(userId, allMessages);
    }

    public List<ConversationResponse> getStudioConversations(Long userId) {
        List<Message> messages = messageRepository.findStudioMessages(userId);
        return buildConversations(userId, messages);
    }

    public List<ConversationResponse> getProfileConversations(Long userId) {
        List<Message> messages = messageRepository.findProfileMessages(userId);
        return buildConversations(userId, messages);
    }

    private List<ConversationResponse> buildConversations(Long userId, List<Message> messages) {
        // Group messages by (otherUser, merchantId) pair to separate threads by shop
        Map<String, List<Message>> groupedMessages = messages.stream()
                .collect(Collectors.groupingBy(m -> {
                    long otherId = m.getSender().getUserId().equals(userId) 
                            ? m.getReceiver().getUserId() 
                            : m.getSender().getUserId();
                    long mercId = m.getMerchant() != null ? m.getMerchant().getUserId() : 0;
                    return otherId + "_" + mercId;
                }));

        List<ConversationResponse> conversations = new ArrayList<>();

        for (Map.Entry<String, List<Message>> entry : groupedMessages.entrySet()) {
            String[] parts = entry.getKey().split("_");
            Long otherId = Long.parseLong(parts[0]);
            Long mercId = Long.parseLong(parts[1]);
            List<Message> thread = entry.getValue();
            
            // Sort thread by date desc to get last
            thread.sort((a, b) -> b.getSentAt().compareTo(a.getSentAt()));
            Message lastMessage = thread.get(0);

            User otherUser = otherId.equals(lastMessage.getSender().getUserId()) 
                    ? lastMessage.getSender() 
                    : lastMessage.getReceiver();

            long unreadCount = thread.stream()
                    .filter(m -> m.getReceiver().getUserId().equals(userId) && !m.getIsRead())
                    .count();

            ConversationResponse conv = new ConversationResponse();
            conv.setOtherUserId(otherId);
            conv.setOtherUserName(otherUser.getUserName());
            conv.setOtherUserPhoto(otherUser.getProfilePhoto());
            conv.setMerchantId(mercId > 0 ? mercId : null);
            conv.setLastMessage(lastMessage.getContent());
            conv.setLastMessageTime(lastMessage.getSentAt());
            
            boolean isLastFromOther = lastMessage.getSender().getUserId().equals(otherId);
            conv.setIsRead(isLastFromOther ? lastMessage.getIsRead() : true);
            conv.setUnreadCount(unreadCount);

            conversations.add(conv);
        }

        conversations.sort((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()));
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