package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Notification;
import com.dressrosa.dressrosa_backend.model.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for user
    List<Notification> findByUserUserId(Long userId);
    Page<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find unread notifications
    List<Notification> findByUserUserIdAndIsReadFalse(Long userId);
    Page<Notification> findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find notifications by type
    List<Notification> findByUserUserIdAndType(Long userId, NotificationType type);
    
    // Count unread notifications
    long countByUserUserIdAndIsReadFalse(Long userId);
    
    // Count notifications by type
    long countByUserUserIdAndType(Long userId, NotificationType type);
    
    // Delete all notifications for user
    void deleteByUserUserId(Long userId);
    
    // Find recent notifications (last 10)
    List<Notification> findTop10ByUserUserIdOrderByCreatedAtDesc(Long userId);
}