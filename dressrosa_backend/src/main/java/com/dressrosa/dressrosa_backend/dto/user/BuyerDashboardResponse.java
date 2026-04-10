package com.dressrosa.dressrosa_backend.dto.user;

import lombok.Data;

@Data
public class BuyerDashboardResponse {
    // Order stats
    private Long totalOrders;
    private Long pendingOrders;
    private Long deliveredOrders;
    
    // Social stats
    private Long savedProducts;
    private Long likedProducts;
    private Long followingCount;
    
    // Activity
    private Long reviewsGiven;
    private Long unreadMessages;
}