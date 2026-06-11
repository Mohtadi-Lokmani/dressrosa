package com.dressrosa.dressrosa_backend.dto.order;

import com.dressrosa.dressrosa_backend.model.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<OrderDetailResponse> items;

    // Buyer and seller details
    private Long buyerId;
    private String buyerName;
    private String buyerPhone;
    private Long sellerId;
    private String sellerName;
    private String shippingAddress;

    // Payment info
    private String paymentMethod;
    private String paymentStatus;
}