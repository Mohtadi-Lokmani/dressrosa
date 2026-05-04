package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.payment.PaymentRequest;
import com.dressrosa.dressrosa_backend.dto.payment.PaymentResponse;
import com.dressrosa.dressrosa_backend.model.*;
import com.dressrosa.dressrosa_backend.repository.OrderRepository;
import com.dressrosa.dressrosa_backend.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponse createPaymentIntent(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // If it's COD, we don't need a payment intent
        if (order.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY) {
            throw new RuntimeException("CASH_ON_DELIVERY orders do not require online payment");
        }

        BigDecimal amount = order.getTotalAmount();
        
        // Simulation or Real Stripe
        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            // Simulation Mode
            String simulatedSecret = "simulated_secret_" + UUID.randomUUID().toString();
            String transactionId = "sim_txn_" + UUID.randomUUID().toString();
            
            // Log a payment entry
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(amount);
            payment.setStatus(PaymentStatus.PENDING);
            payment.setMethod(PaymentMethod.BANK_CARD);
            payment.setTransactionId(transactionId);
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .clientSecret(simulatedSecret)
                    .transactionId(transactionId)
                    .status("PENDING")
                    .build();
        } else {
            // Real Stripe implementation
            Stripe.apiKey = stripeApiKey;
            try {
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amount.multiply(new BigDecimal(100)).longValue()) // Amount in cents
                        .setCurrency("usd") // Change to tnd if using Tunisian gateway later
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .putMetadata("orderId", order.getOrderId().toString())
                        .build();

                PaymentIntent intent = PaymentIntent.create(params);
                
                Payment payment = new Payment();
                payment.setOrder(order);
                payment.setAmount(amount);
                payment.setStatus(PaymentStatus.PENDING);
                payment.setMethod(PaymentMethod.BANK_CARD);
                payment.setTransactionId(intent.getId());
                paymentRepository.save(payment);

                return PaymentResponse.builder()
                        .clientSecret(intent.getClientSecret())
                        .transactionId(intent.getId())
                        .status(intent.getStatus())
                        .build();
            } catch (Exception e) {
                throw new RuntimeException("Stripe error: " + e.getMessage());
            }
        }
    }

    @Transactional
    public void confirmPayment(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus(PaymentStatus.PAID);
        paymentRepository.save(payment);
        
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
    }

    public Optional<Payment> findByOrderId(Long orderId) {
        return paymentRepository.findByOrderOrderId(orderId);
    }
}
