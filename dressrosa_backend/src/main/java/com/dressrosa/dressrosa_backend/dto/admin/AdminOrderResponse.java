package com.dressrosa.dressrosa_backend.dto.admin;

import com.dressrosa.dressrosa_backend.model.OrderStatus;
import com.dressrosa.dressrosa_backend.model.PaymentMethod;
import com.dressrosa.dressrosa_backend.model.PaymentStatus;
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
public class AdminOrderResponse {
    private Long orderId;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime orderDate;

    // Buyer info
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;

    // Seller info
    private Long sellerId;
    private String sellerName;
    private String sellerShopName;

    private int itemCount;
}
