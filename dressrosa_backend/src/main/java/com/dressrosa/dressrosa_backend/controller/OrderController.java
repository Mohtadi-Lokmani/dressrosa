package com.dressrosa.dressrosa_backend.controller;
import com.dressrosa.dressrosa_backend.dto.order.OrderListResponse;
import com.dressrosa.dressrosa_backend.dto.order.OrderRequest;
import com.dressrosa.dressrosa_backend.dto.order.OrderResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.model.OrderStatus;
import com.dressrosa.dressrosa_backend.service.OrderService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<List<OrderResponse>> placeOrder(@Valid @RequestBody OrderRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        List<OrderResponse> orders = orderService.placeOrder(request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(orders);
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        OrderResponse order = orderService.getOrderById(orderId, currentUser.getUserId());
        return ResponseEntity.ok(order);
    }
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderListResponse>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        Page<OrderListResponse> orders = orderService.getBuyerOrders(currentUser.getUserId(), pageable);
        
        return ResponseEntity.ok(orders);
    }
    @GetMapping("/my-sales")
    public ResponseEntity<Page<OrderListResponse>> getMySales(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        Page<OrderListResponse> orders = orderService.getSellerOrders(
            currentUser.getUserId(), status, pageable
        );
        
        return ResponseEntity.ok(orders);
    }
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        OrderResponse order = orderService.updateOrderStatus(orderId, status, currentUser.getUserId());
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long orderId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        OrderResponse order = orderService.cancelOrder(orderId, currentUser.getUserId());
        return ResponseEntity.ok(order);
    }
}