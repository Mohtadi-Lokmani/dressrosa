package com.dressrosa.dressrosa_backend.dto.social;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long reviewId;
    private Integer rate;
    private String comment;
    private LocalDateTime date;
    
    // User info
    private Long userId;
    private String userName;
    private String userPhoto;
    
    // Product info
    private Long productId;
    private String productTitle;
}