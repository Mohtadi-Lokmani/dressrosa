package com.dressrosa.dressrosa_backend.dto.user;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SellerProfileDTO {
    private Long userId;
    private String userName;
    private String profilePhoto;
    private String bannerImage;
    private String bio;
    private Boolean verificationBadge;
    private LocalDateTime createdAt;
    
    // Statistics
    private Long totalProducts;
    private Long followersCount;
    private Long followingCount;
    private Double averageRating;
    private Long ordersCompleted;
}