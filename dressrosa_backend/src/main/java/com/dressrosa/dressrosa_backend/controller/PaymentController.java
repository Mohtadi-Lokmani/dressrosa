package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.payment.PaymentRequest;
import com.dressrosa.dressrosa_backend.dto.payment.PaymentResponse;
import com.dressrosa.dressrosa_backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(@RequestParam String transactionId) {
        paymentService.confirmPayment(transactionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<com.dressrosa.dressrosa_backend.model.Payment> getPaymentByOrder(@PathVariable Long orderId) {
        return paymentService.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
