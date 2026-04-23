package com.dressrosa.dressrosa_backend.dto.product;

import com.dressrosa.dressrosa_backend.model.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private Long productId;
    private String title;
    private String description;
    private BigDecimal price;
    private ProductStatus status;
    private Integer viewsCount;
    private Boolean isBoosted;
    private LocalDateTime createdAt;
    
    // Category info
    private Long categoryId;
    private String categoryName;
    
    // Seller info
    private Long sellerId;
    private String sellerName;
    private Boolean sellerVerified;
    
    // Media
    private List<String> imageUrls;
    private List<String> videoUrls;
    private List<ProductMediaDTO> media;
    
    // Variants
    private List<ProductVariantResponse> variants;
    
    // Statistics
    private Long likesCount;
    private Long savesCount;
    private Double averageRating;
    private Long reviewsCount;
}