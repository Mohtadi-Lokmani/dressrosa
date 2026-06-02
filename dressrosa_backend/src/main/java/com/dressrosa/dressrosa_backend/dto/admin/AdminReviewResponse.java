package com.dressrosa.dressrosa_backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewResponse {
    private Long reviewId;
    private Integer rate;
    private String comment;
    private LocalDateTime date;

    // Reviewer info
    private Long userId;
    private String userName;
    private String userPhoto;

    // Product info
    private Long productId;
    private String productTitle;

    // Seller info
    private Long sellerId;
    private String sellerName;
}
