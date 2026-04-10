package com.dressrosa.dressrosa_backend.dto.social;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private Long messageId;
    private String content;
    private Boolean isRead;
    private LocalDateTime sentAt;
    private LocalDateTime seenAt;
    
    // Sender info
    private Long senderId;
    private String senderName;
    private String senderPhoto;
    
    // Receiver info
    private Long receiverId;
    private String receiverName;
    private String receiverPhoto;
}