package com.dressrosa.dressrosa_backend.dto.product;

import com.dressrosa.dressrosa_backend.model.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductListResponse {
    private Long productId;
    private String title;
    private BigDecimal price;
    private ProductStatus status;
    private Integer viewsCount;
    private Boolean isBoosted;
    private LocalDateTime createdAt;
    
    // Variantes pour le filtrage
    private List<ProductVariantResponse> variants;
    

    private String imageUrl;
    private List<ProductMediaDTO> media;
    private Long sellerId;
    private String sellerName;
    private Boolean sellerVerified;
    private Long likesCount;
    private Double averageRating;
}