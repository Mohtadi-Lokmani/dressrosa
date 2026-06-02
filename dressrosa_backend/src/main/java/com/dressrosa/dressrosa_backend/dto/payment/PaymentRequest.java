package com.dressrosa.dressrosa_backend.dto.payment;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long orderId;
    private Long productId; // Used for BOOST payments
    private String type = "ORDER"; // ORDER or BOOST
    private String paymentMethodId; // From Stripe.js or simulated
}
