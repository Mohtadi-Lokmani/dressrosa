package com.dressrosa.dressrosa_backend.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {
    
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    
    private String paymentMethod; // "CASH_ON_DELIVERY" or "BANK_CARD"
}