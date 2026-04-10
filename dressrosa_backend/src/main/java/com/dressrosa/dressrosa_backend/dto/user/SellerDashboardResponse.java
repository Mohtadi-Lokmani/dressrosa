package com.dressrosa.dressrosa_backend.dto.user;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SellerDashboardResponse {
    // Product stats
    private Long totalProducts;
    private Long inStockProducts;
    private Long soldOutProducts;
    
    // View stats
    private Integer totalViews;
    private Integer todayViews;
    private Integer weekViews;
    
    // Social stats
    private Long followersCount;
    private Long totalLikes;
    
    // Message stats
    private Long unreadMessages;
    private Long todayMessages;
    
    // Sales stats
    private BigDecimal totalSales;
    private BigDecimal currentMonthSales;
    
    // Order stats
    private Long totalOrders;
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long shippedOrders;
}