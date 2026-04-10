package com.dressrosa.dressrosa_backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderDetailResponse {
    private Long detailId;
    private Integer quantity;
    private BigDecimal totalPrice;
    
    // Product info
    private Long productId;
    private String productTitle;
    private String productImage;
    
    // Variant info 
    private Long variantId;
    private String color;
    private String size;
}