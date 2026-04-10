package com.dressrosa.dressrosa_backend.dto.order;

import com.dressrosa.dressrosa_backend.model.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long orderId;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private LocalDateTime orderDate;

    private Long sellerId;
    private String sellerName;

    private Long buyerId;
    private String buyerName;

    private List<OrderDetailResponse> items;
}