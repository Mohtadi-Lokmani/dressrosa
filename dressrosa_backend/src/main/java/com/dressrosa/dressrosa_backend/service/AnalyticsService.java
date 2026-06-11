package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.studio.StudioAnalyticsResponse;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductViewRepository productViewRepository;


    @Autowired
    private FollowRepository followRepository;

    public StudioAnalyticsResponse getOverview(Long sellerId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Stat cards
        java.math.BigDecimal rawRevenue = orderRepository.getTotalSales(sellerId);
        Long revenue = rawRevenue != null ? rawRevenue.longValue() : 0L;
        Long orders = orderRepository.countBySellerUserId(sellerId);
        Long productViews = productViewRepository.countBySellerId(sellerId);
        Long profileVisits = 0L;
        Long followers = followRepository.countByFollowingUserId(sellerId);

        // Daily Revenue Chart
        List<Object[]> rawDailyRevenue = orderRepository.findDailyRevenueForSeller(sellerId, since);
        List<StudioAnalyticsResponse.DailyMetric> dailyRevenue = rawDailyRevenue.stream()
                .map(row -> new StudioAnalyticsResponse.DailyMetric(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        // Daily Views Chart (Product + Profile combined for now)
        List<Object[]> rawProductViews = productViewRepository.findDailyViewsForSeller(sellerId, since);
        List<StudioAnalyticsResponse.DailyMetric> dailyViews = rawProductViews.stream()
                .map(row -> new StudioAnalyticsResponse.DailyMetric(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        return StudioAnalyticsResponse.builder()
                .totalRevenue(revenue != null ? revenue : 0L)
                .totalOrders(orders)
                .totalProductViews(productViews)
                .totalProfileVisits(profileVisits)
                .totalFollowers(followers)
                .dailyRevenue(dailyRevenue)
                .dailyViews(dailyViews)
                .build();
    }
}
