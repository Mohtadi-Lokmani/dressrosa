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
    
    /**
     * CREATE NOTIFICATION
     * 
     * What it does:
     * - Create a system notification for user
     * - Different types: MESSAGE, ORDER, FOLLOW, LIKE, REVIEW
     * - Each notification has title, message, and optional link (relatedId)
     * - Used by other services to notify users of events
     * 
     * Notification types and when they're created:
     * - MESSAGE: New chat message received
     * - ORDER: Order status changed (confirmed, shipped, etc.)
     * - FOLLOW: Someone followed you
     * - LIKE: Someone liked your product
     * - REVIEW: Someone reviewed your product
     * 
     * @param userId - Who receives the notification
     * @param type - Notification type (MESSAGE, ORDER, etc.)
     * @param title - Notification title (e.g., "New Order")
     * @param message - Notification message (e.g., "John placed an order")
     * @param relatedId - ID of related entity (orderId, messageId, etc.)
     * @return Created notification
     * 
     * Example usage from other services:
     * notificationService.createNotification(
     *     sellerId,
     *     NotificationType.ORDER,
     *     "New Order Received",
     *     "You have a new order from John Doe",
     *     orderId
     * );
     */
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
        
        // TODO: In real app, push notification here:
        // pushNotificationService.send(userId, title, message);
        // webSocketService.sendNotification(userId, saved);
        
        return saved;
    }
    
    /**
     * GET USER'S NOTIFICATIONS
     * 
     * What it does:
     * - Fetch all notifications for user
     * - Sorted by newest first
     * - Paginated (show 20 at a time, load more on scroll)
     * - Shows both read and unread
     * 
     * Used in:
     * - Notification center/bell icon dropdown
     * - Notifications page
     * 
     * @param userId - Current user
     * @param pageable - Page settings (page number, size, sort)
     * @return Page of notifications
     */
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return notifications.map(this::convertToResponse);
    }
    
    /**
     * GET UNREAD NOTIFICATIONS
     * 
     * What it does:
     * - Fetch only unread notifications
     * - Used to show recent notifications in dropdown
     * - Sorted by newest first
     * 
     * Example: Bell icon shows "3 new notifications"
     * → User clicks bell
     * → Shows these 3 unread notifications
     * 
     * @param userId - Current user
     * @param pageable - Pagination
     * @return Page of unread notifications
     */
    public Page<NotificationResponse> getUnreadNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        
        return notifications.map(this::convertToResponse);
    }
    
    /**
     * GET RECENT NOTIFICATIONS (LAST 10)
     * 
     * What it does:
     * - Quick access to most recent notifications
     * - Used in bell icon dropdown (no pagination needed)
     * - Shows last 10 notifications regardless of read status
     * 
     * @param userId - Current user
     * @return List of 10 most recent notifications
     */
    public List<NotificationResponse> getRecentNotifications(Long userId) {
        List<Notification> notifications = notificationRepository
                .findTop10ByUserUserIdOrderByCreatedAtDesc(userId);
        
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * GET NOTIFICATIONS BY TYPE
     * 
     * What it does:
     * - Filter notifications by type
     * - Examples:
     *   * Show only ORDER notifications (order updates)
     *   * Show only MESSAGE notifications (chat alerts)
     *   * Show only FOLLOW notifications (new followers)
     * 
     * Used for:
     * - Filtered notification views
     * - Type-specific notification pages
     * 
     * @param userId - Current user
     * @param type - Filter by this type
     * @return List of notifications of specified type
     */
    public List<NotificationResponse> getNotificationsByType(
            Long userId, 
            NotificationType type) {
        
        List<Notification> notifications = notificationRepository
                .findByUserUserIdAndType(userId, type);
        
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * GET UNREAD COUNT
     * 
     * What it does:
     * - Count how many unread notifications user has
     * - Used to show notification badge number
     * 
     * Example: Bell icon shows "🔔 5"
     * → User has 5 unread notifications
     * 
     * @param userId - Current user
     * @return Number of unread notifications
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
    }
    
    /**
     * MARK NOTIFICATION AS READ
     * 
     * What it does:
     * - Mark single notification as read
     * - Called when user clicks on a notification
     * - Decrements unread counter
     * 
     * Flow:
     * 1. User sees notification "New order from John"
     * 2. User clicks notification
     * 3. Mark as read
     * 4. Redirect to order details page
     * 
     * @param notificationId - Notification to mark as read
     * @param userId - Current user (for authorization)
     */
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
    
    /**
     * MARK ALL AS READ
     * 
     * What it does:
     * - Mark ALL user's notifications as read
     * - Used when user clicks "Mark all as read" button
     * - Clears notification badge
     * 
     * @param userId - Current user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserUserIdAndIsReadFalse(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    /**
     * DELETE NOTIFICATION
     * 
     * What it does:
     * - Remove a notification
     * - User can delete notifications they don't want
     * - Only owner can delete
     * 
     * @param notificationId - Notification to delete
     * @param userId - Current user
     */
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
    
    /**
     * DELETE ALL NOTIFICATIONS
     * 
     * What it does:
     * - Clear all notifications for user
     * - "Clear all" button functionality
     * 
     * @param userId - Current user
     */
    @Transactional
    public void deleteAllNotifications(Long userId) {
        notificationRepository.deleteByUserUserId(userId);
    }
    
    /**
     * BATCH CREATE NOTIFICATIONS
     * 
     * What it does:
     * - Create multiple notifications at once
     * - Useful for notifying multiple users about same event
     * 
     * Example: New product from seller → notify all followers
     * 
     * @param userIds - List of users to notify
     * @param type - Notification type
     * @param title - Notification title
     * @param message - Notification message
     * @param relatedId - Related entity ID
     */
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
    
    /**
     * CONVERT NOTIFICATION ENTITY TO RESPONSE
     * 
     * What it does:
     * - Transform Notification → NotificationResponse
     * - Include all notification details
     */
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