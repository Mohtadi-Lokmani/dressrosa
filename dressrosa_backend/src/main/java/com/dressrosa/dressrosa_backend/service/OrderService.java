package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.order.*;
import com.dressrosa.dressrosa_backend.model.*;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderDetailRepository orderDetailRepository;
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;
    
    @Autowired
    private ProductMediaRepository productMediaRepository;
    
    @Autowired
    private NotificationService notificationService;
    
  
    @Transactional
    public List<OrderResponse> placeOrder(OrderRequest request, Long buyerId) {
        // Find buyer
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get cart items
        List<Cart> cartItems = cartRepository.findByUserUserId(buyerId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Group cart items by seller (because one order per seller)
        Map<Long, List<Cart>> itemsBySeller = cartItems.stream()
                .collect(Collectors.groupingBy(
                    cart -> cart.getProduct().getSeller().getUserId()
                ));
        
        List<OrderResponse> createdOrders = new ArrayList<>();
        
        // Create one order for each seller
        for (Map.Entry<Long, List<Cart>> entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<Cart> sellerItems = entry.getValue();
            
            User seller = userRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            
            // Calculate order total
            BigDecimal orderTotal = sellerItems.stream()
                    .map(cart -> cart.getProduct().getPrice()
                            .multiply(BigDecimal.valueOf(cart.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Create order
            Order order = new Order();
            order.setBuyer(buyer);
            order.setSeller(seller);
            order.setTotalAmount(orderTotal);
            order.setShippingAddress(request.getShippingAddress());
            order.setStatus(OrderStatus.PENDING);
            
            // Set payment info
            if (request.getPaymentMethod() != null) {
                order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
            }
            
            if (order.getPaymentMethod() == PaymentMethod.BANK_CARD) {
                order.setPaymentStatus(PaymentStatus.PENDING);
            } else {
                order.setPaymentStatus(PaymentStatus.UNPAID);
            }
            
            Order savedOrder = orderRepository.save(order);
            
            // Create order details and deduct stock
            for (Cart cartItem : sellerItems) {
                // Verify stock still available
                if (cartItem.getVariant() != null) {
                    ProductVariant variant = productVariantRepository.findById(
                        cartItem.getVariant().getVariantId()
                    ).orElseThrow(() -> new RuntimeException("Variant not found"));
                    
                    if (variant.getQuantity() < cartItem.getQuantity()) {
                        throw new RuntimeException(
                            "Insufficient stock for " + cartItem.getProduct().getTitle() +
                            ". Available: " + variant.getQuantity()
                        );
                    }
                    
                    // Deduct stock
                    variant.setQuantity(variant.getQuantity() - cartItem.getQuantity());
                    productVariantRepository.save(variant);
                    
                    // Check if product should be marked as sold out
                    boolean hasStock = productVariantRepository.hasStock(
                        cartItem.getProduct().getProductId()
                    );
                    if (!hasStock) {
                        Product product = cartItem.getProduct();
                        product.setStatus(ProductStatus.SOLD_OUT);
                        productRepository.save(product);
                    }
                }
                
                // Create order detail
                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setProduct(cartItem.getProduct());
                detail.setVariant(cartItem.getVariant());
                detail.setQuantity(cartItem.getQuantity());
                detail.setTotalPrice(
                    cartItem.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                );
                orderDetailRepository.save(detail);
            }
            
            // Send notification to seller
            notificationService.createNotification(
                sellerId,
                NotificationType.ORDER,
                NotificationAudience.SELLER,
                "New Order Received",
                "You have a new order from " + buyer.getUserName(),
                savedOrder.getOrderId()
            );
            
            createdOrders.add(convertToResponse(savedOrder));
        }
        
        // Clear cart after successful order
        cartRepository.deleteByUserUserId(buyerId);
        
        return createdOrders;
    }
    
  
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check authorization (must be buyer or seller)
        if (!order.getBuyer().getUserId().equals(userId) && 
            !order.getSeller().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to view this order");
        }
        
        return convertToResponse(order);
    }
    
  
    public Page<OrderListResponse> getBuyerOrders(Long buyerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByBuyerUserId(buyerId, pageable);
        return orders.map(this::convertToListResponse);
    }
    
  
    public Page<OrderListResponse> getSellerOrders(Long sellerId, OrderStatus status, Pageable pageable) {
        Page<Order> orders;
        
        if (status != null) {
            orders = orderRepository.findBySellerUserIdAndStatus(sellerId, status, pageable);
        } else {
            orders = orderRepository.findBySellerUserId(sellerId, pageable);
        }
        
        return orders.map(this::convertToListResponse);
    }
    
  
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check authorization (only seller can update)
        if (!order.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("Only the seller can update order status");
        }
        
        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);
        
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        // Notify buyer
        String message = getStatusChangeMessage(newStatus, order.getSeller().getUserName());
        notificationService.createNotification(
            order.getBuyer().getUserId(),
            NotificationType.ORDER,
            NotificationAudience.BUYER,
            "Order Status Updated",
            message,
            orderId
        );
        
        return convertToResponse(updatedOrder);
    }
  
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check authorization (buyer or seller can cancel)
        if (!order.getBuyer().getUserId().equals(userId) && 
            !order.getSeller().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Can only cancel if PENDING or CONFIRMED
        if (order.getStatus() != OrderStatus.PENDING && 
            order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Cannot cancel order at this stage");
        }
        
        // Restore stock
        List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(orderId);
        for (OrderDetail detail : details) {
            if (detail.getVariant() != null) {
                ProductVariant variant = detail.getVariant();
                variant.setQuantity(variant.getQuantity() + detail.getQuantity());
                productVariantRepository.save(variant);
                
                // Update product status if it was sold out
                Product product = detail.getProduct();
                if (product.getStatus() == ProductStatus.SOLD_OUT) {
                    product.setStatus(ProductStatus.IN_STOCK);
                    productRepository.save(product);
                }
            }
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        
        // Notify other party
        Long notifyUserId = userId.equals(order.getBuyer().getUserId()) 
            ? order.getSeller().getUserId() 
            : order.getBuyer().getUserId();
        
        NotificationAudience audience = userId.equals(order.getBuyer().getUserId())
            ? NotificationAudience.SELLER
            : NotificationAudience.BUYER;
        
        notificationService.createNotification(
            notifyUserId,
            NotificationType.ORDER,
            audience,
            "Order Cancelled",
            "Order #" + orderId + " has been cancelled",
            orderId
        );
        
        return convertToResponse(cancelledOrder);
    }
    
   
    private void validateStatusTransition(OrderStatus current, OrderStatus newStatus) {
        // Can always cancel
        if (newStatus == OrderStatus.CANCELLED) {
            return;
        }
        
        // Define valid transitions
        Map<OrderStatus, List<OrderStatus>> validTransitions = Map.of(
            OrderStatus.PENDING, List.of(OrderStatus.CONFIRMED),
            OrderStatus.CONFIRMED, List.of(OrderStatus.SHIPPED),
            OrderStatus.SHIPPED, List.of(OrderStatus.DELIVERED)
        );
        
        List<OrderStatus> allowedNext = validTransitions.get(current);
        if (allowedNext == null || !allowedNext.contains(newStatus)) {
            throw new RuntimeException(
                "Invalid status transition from " + current + " to " + newStatus
            );
        }
    }
    
    
    private String getStatusChangeMessage(OrderStatus status, String sellerName) {
        return switch (status) {
            case CONFIRMED -> sellerName + " confirmed your order";
            case SHIPPED -> "Your order has been shipped by " + sellerName;
            case DELIVERED -> "Your order has been delivered";
            case CANCELLED -> "Your order has been cancelled";
            default -> "Order status updated";
        };
    }
    
   
    private OrderResponse convertToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        
        response.setOrderId(order.getOrderId());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setShippingAddress(order.getShippingAddress());
        response.setOrderDate(order.getOrderDate());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        
        // Seller info
        response.setSellerId(order.getSeller().getUserId());
        response.setSellerName(order.getSeller().getUserName());
        
        // Buyer info
        response.setBuyerId(order.getBuyer().getUserId());
        response.setBuyerName(order.getBuyer().getUserName());
        
        // Order items
        List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(order.getOrderId());
        response.setItems(details.stream()
            .map(this::convertDetailToResponse)
            .collect(Collectors.toList()));
        
        return response;
    }
    
  
    private OrderListResponse convertToListResponse(Order order) {
        OrderListResponse response = new OrderListResponse();
        
        response.setOrderId(order.getOrderId());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setOrderDate(order.getOrderDate());
        
        // Show seller for buyer view, buyer for seller view
        response.setOtherUserId(order.getSeller().getUserId());
        response.setOtherUserName(order.getSeller().getUserName());
        
        // Items count
        List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(order.getOrderId());
        response.setItemsCount(details.size());
        
        // First product image
        if (!details.isEmpty()) {
            List<ProductMedia> media = productMediaRepository.findByProductProductId(
                details.get(0).getProduct().getProductId()
            );
            if (!media.isEmpty()) {
                response.setFirstProductImage(media.get(0).getUrl());
            }
        }

        // Payment info
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        
        return response;
    }
   
    private OrderDetailResponse convertDetailToResponse(OrderDetail detail) {
        OrderDetailResponse response = new OrderDetailResponse();
        
        response.setDetailId(detail.getDetailId());
        response.setQuantity(detail.getQuantity());
        response.setTotalPrice(detail.getTotalPrice());
        
        // Product info
        response.setProductId(detail.getProduct().getProductId());
        response.setProductTitle(detail.getProduct().getTitle());
        
        // Product image
        List<ProductMedia> media = productMediaRepository.findByProductProductId(
            detail.getProduct().getProductId()
        );
        if (!media.isEmpty()) {
            response.setProductImage(media.get(0).getUrl());
        }
        
        // Variant info
        if (detail.getVariant() != null) {
            response.setVariantId(detail.getVariant().getVariantId());
            response.setColor(detail.getVariant().getColor());
            response.setSize(detail.getVariant().getSize());
        }
        
        return response;
    }
}