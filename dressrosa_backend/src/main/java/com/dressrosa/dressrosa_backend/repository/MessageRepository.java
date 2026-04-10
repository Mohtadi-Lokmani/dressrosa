package com.dressrosa.dressrosa_backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dressrosa.dressrosa_backend.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get conversation between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.userId = :user1Id AND m.receiver.userId = :user2Id) OR " +
           "(m.sender.userId = :user2Id AND m.receiver.userId = :user1Id) " +
           "ORDER BY m.sentAt ASC")
    List<Message> getConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.userId = :user1Id AND m.receiver.userId = :user2Id) OR " +
           "(m.sender.userId = :user2Id AND m.receiver.userId = :user1Id) " +
           "ORDER BY m.sentAt DESC")
    Page<Message> getConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id, Pageable pageable);
    
    // Find messages sent by user
    List<Message> findBySenderUserId(Long senderId);
    
    // Find messages received by user
    List<Message> findByReceiverUserId(Long receiverId);
    
    // Get unread messages for user
    @Query("SELECT m FROM Message m WHERE m.receiver.userId = :userId AND m.isRead = false " +
           "ORDER BY m.sentAt DESC")
    List<Message> getUnreadMessages(@Param("userId") Long userId);
    
    // Count unread messages for user
    long countByReceiverUserIdAndIsReadFalse(Long receiverId);
    
    // Get all conversations for a user 
    @Query("SELECT DISTINCT CASE " +
           "WHEN m.sender.userId = :userId THEN m.receiver " +
           "ELSE m.sender END " +
           "FROM Message m " +
           "WHERE m.sender.userId = :userId OR m.receiver.userId = :userId")
    List<Object> getUserConversations(@Param("userId") Long userId);
    
    // Get last message in conversation
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.userId = :user1Id AND m.receiver.userId = :user2Id) OR " +
           "(m.sender.userId = :user2Id AND m.receiver.userId = :user1Id) " +
           "ORDER BY m.sentAt DESC LIMIT 1")
    Message getLastMessage(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    // Count messages received today
@Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.userId = :userId " +
       "AND CAST(m.sentAt AS DATE) = CURRENT_DATE")
long countTodayMessages(@Param("userId") Long userId);
}