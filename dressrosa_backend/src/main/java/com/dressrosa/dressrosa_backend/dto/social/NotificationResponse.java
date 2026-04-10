package com.dressrosa.dressrosa_backend.dto.social;

import com.dressrosa.dressrosa_backend.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long notificationId;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private Long relatedId;
    private LocalDateTime createdAt;
}