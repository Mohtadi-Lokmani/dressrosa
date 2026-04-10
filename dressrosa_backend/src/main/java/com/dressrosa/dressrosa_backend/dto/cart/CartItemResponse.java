package com.dressrosa.dressrosa_backend.dto.cart;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemResponse {
    private Long cartId;
    private Integer quantity;
    
    // Product info
    private Long productId;
    private String productTitle;
    private BigDecimal productPrice;
    private String productImage;
    
    // Variant info 
    private Long variantId;
    private String color;
    private String size;
    
    // Seller info
    private Long sellerId;
    private String sellerName;
    
    // Calculated
    private BigDecimal itemTotal;  
}