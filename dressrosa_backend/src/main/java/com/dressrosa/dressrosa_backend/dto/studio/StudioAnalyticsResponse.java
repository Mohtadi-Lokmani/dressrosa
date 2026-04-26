package com.dressrosa.dressrosa_backend.dto.studio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudioAnalyticsResponse {
    
    // Overview metrics
    private Long totalRevenue;
    private Long totalOrders;
    private Long totalProductViews;
    private Long totalProfileVisits;
    private Long totalFollowers;

    // Charts data
    private List<DailyMetric> dailyRevenue;
    private List<DailyMetric> dailyViews;

    @Data
    @AllArgsConstructor
    public static class DailyMetric {
        private String date;
        private Long value;
    }
}
