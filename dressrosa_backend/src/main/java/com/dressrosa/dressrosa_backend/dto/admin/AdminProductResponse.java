package com.dressrosa.dressrosa_backend.dto.admin;

import com.dressrosa.dressrosa_backend.model.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductResponse {
    private Long productId;
    private String title;
    private String description;
    private BigDecimal price;
    private ProductStatus status;
    private Integer viewsCount;
    private Boolean isBoosted;
    private LocalDateTime createdAt;
    private String photoUrl;

    // Category
    private Long categoryId;
    private String categoryName;

    // Seller info
    private Long sellerId;
    private String sellerName;
    private String sellerShopName;

    // Stats
    private long likeCount;
    private long reviewCount;
    private long orderCount;
}
