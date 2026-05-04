package com.dressrosa.dressrosa_backend.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private String clientSecret; // For Stripe.js
    private String transactionId;
    private String status;
}
