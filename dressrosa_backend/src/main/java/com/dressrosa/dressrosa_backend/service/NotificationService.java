package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.social.NotificationResponse;
import com.dressrosa.dressrosa_backend.model.Notification;
import com.dressrosa.dressrosa_backend.model.NotificationType;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.repository.NotificationRepository;
import com.dressrosa.dressrosa_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    
    @Transactional
    public Notification createNotification(
            Long userId, 
            NotificationType type, 
            String title, 
            String message, 
            Long relatedId) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedId(relatedId);
        notification.setIsRead(false);  // New notification is unread
        
        Notification saved = notificationRepository.save(notification);
        
      
        
        return saved;
    }
   
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return notifications.map(this::convertToResponse);
    }
    
   
    public Page<NotificationResponse> getUnreadNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        
        return notifications.map(this::convertToResponse);
    }
    
    
    public List<NotificationResponse> getRecentNotifications(Long userId) {
        List<Notification> notifications = notificationRepository
                .findTop10ByUserUserIdOrderByCreatedAtDesc(userId);
        
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
   
    public List<NotificationResponse> getNotificationsByType(
            Long userId, 
            NotificationType type) {
        
        List<Notification> notifications = notificationRepository
                .findByUserUserIdAndType(userId, type);
        
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
  
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
    }
    
  
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Check authorization
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
  
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserUserIdAndIsReadFalse(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
  
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Check authorization
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        notificationRepository.delete(notification);
    }
    
    
    @Transactional
    public void deleteAllNotifications(Long userId) {
        notificationRepository.deleteByUserUserId(userId);
    }
    
    
    @Transactional
    public void createBatchNotifications(
            List<Long> userIds, 
            NotificationType type, 
            String title, 
            String message, 
            Long relatedId) {
        
        for (Long userId : userIds) {
            createNotification(userId, type, title, message, relatedId);
        }
    }
   
    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        
        response.setNotificationId(notification.getNotificationId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setIsRead(notification.getIsRead());
        response.setRelatedId(notification.getRelatedId());
        response.setCreatedAt(notification.getCreatedAt());
        
        return response;
    }
}