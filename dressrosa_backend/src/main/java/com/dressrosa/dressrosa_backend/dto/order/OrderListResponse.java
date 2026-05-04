package com.dressrosa.dressrosa_backend.dto.order;

import com.dressrosa.dressrosa_backend.model.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderListResponse {
    private Long orderId;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    
    // Seller or buyer name 
    private Long otherUserId;
    private String otherUserName;
    
    // Quick summary
    private Integer itemsCount;
    private String firstProductImage;

    // Payment info
    private String paymentMethod;
    private String paymentStatus;
}