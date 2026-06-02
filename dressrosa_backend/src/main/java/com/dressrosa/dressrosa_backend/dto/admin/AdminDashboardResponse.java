package com.dressrosa.dressrosa_backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalBuyers;
    private long totalSellers;
    private long totalProducts;
    private long totalOrders;
    private long pendingOrders;
    private long totalReviews;
    private long totalCategories;
    private BigDecimal totalRevenue;
    private BigDecimal monthRevenue;

    // Recent activity counts
    private long newUsersThisWeek;
    private long newOrdersThisWeek;
    private long newProductsThisWeek;
}
