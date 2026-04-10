package com.dressrosa.dressrosa_backend.dto.social;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationResponse {
    private Long otherUserId;
    private String otherUserName;
    private String otherUserPhoto;
    
    // Last message info
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Boolean isRead;
    
    // Unread count
    private Long unreadCount;
}