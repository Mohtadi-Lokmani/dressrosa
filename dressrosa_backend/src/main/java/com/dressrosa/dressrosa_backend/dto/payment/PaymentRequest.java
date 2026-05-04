package com.dressrosa.dressrosa_backend.dto.payment;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long orderId;
    private String paymentMethodId; // From Stripe.js or simulated
}
