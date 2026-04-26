package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.studio.StudioHomeTodoResponse;
import com.dressrosa.dressrosa_backend.model.OrderStatus;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudioHomeService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public StudioHomeTodoResponse getTodoItems(Long sellerId) {
        List<StudioHomeTodoResponse.TodoItem> items = new ArrayList<>();

        // 1. Pending Orders
        long pendingOrders = orderRepository.countBySellerUserIdAndStatus(sellerId, OrderStatus.PENDING);
        if (pendingOrders > 0) {
            items.add(StudioHomeTodoResponse.TodoItem.builder()
                .id("orders-pending")
                .type("ORDER")
                .title(pendingOrders + " orders pending")
                .description("You have " + pendingOrders + " new orders waiting for confirmation.")
                .actionText("View Orders")
                .actionLink("/studio/orders")
                .count((int) pendingOrders)
                .priority("HIGH")
                .build());
        }

        // 2. Unread Messages (placeholder for now, needs real count)
        items.add(StudioHomeTodoResponse.TodoItem.builder()
            .id("messages-unread")
            .type("MESSAGE")
            .title("Unread messages")
            .description("Buyers are waiting for your response.")
            .actionText("Reply Now")
            .actionLink("/studio/messages")
            .priority("MEDIUM")
            .build());

        // 3. Out of Stock
        // This is a placeholder logic, would need a findOutOfStockBySeller in productRepository
        
        return StudioHomeTodoResponse.builder().items(items).build();
    }
}
