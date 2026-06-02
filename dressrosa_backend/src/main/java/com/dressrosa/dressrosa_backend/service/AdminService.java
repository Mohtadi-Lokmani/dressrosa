package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.admin.*;
import com.dressrosa.dressrosa_backend.model.*;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    // ==================== DASHBOARD ====================

    public AdminDashboardResponse getDashboard() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        long totalUsers = userRepository.count();
        long totalBuyers = userRepository.countByRole(Role.BUYER);
        long totalSellers = userRepository.countByRole(Role.SELLER);
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING).size();
        long totalReviews = reviewRepository.count();
        long totalCategories = categoryRepository.count();

        BigDecimal totalRevenue = orderRepository.getPlatformTotalRevenue();
        BigDecimal monthRevenue = orderRepository.getPlatformMonthRevenue();

        long newUsersThisWeek = userRepository.countByCreatedAtAfter(oneWeekAgo);
        long newOrdersThisWeek = orderRepository.countByOrderDateAfter(oneWeekAgo);
        long newProductsThisWeek = productRepository.countByCreatedAtAfter(oneWeekAgo);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalBuyers(totalBuyers)
                .totalSellers(totalSellers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalReviews(totalReviews)
                .totalCategories(totalCategories)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .monthRevenue(monthRevenue != null ? monthRevenue : BigDecimal.ZERO)
                .newUsersThisWeek(newUsersThisWeek)
                .newOrdersThisWeek(newOrdersThisWeek)
                .newProductsThisWeek(newProductsThisWeek)
                .build();
    }

    // ==================== USERS ====================

    public Page<AdminUserResponse> getAllUsers(String search, Role role, Pageable pageable) {
        Page<User> users;

        if (search != null && !search.isEmpty() && role != null) {
            users = userRepository.findByUserNameContainingIgnoreCaseAndRole(search, role, pageable);
        } else if (search != null && !search.isEmpty()) {
            users = userRepository.findByUserNameContainingIgnoreCase(search, pageable);
        } else if (role != null) {
            users = userRepository.findByRole(role, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::convertToAdminUserResponse);
    }

    @Transactional
    public void toggleVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationBadge(!Boolean.TRUE.equals(user.getVerificationBadge()));
        userRepository.save(user);
    }

    @Transactional
    public void changeUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    // ==================== PRODUCTS ====================

    public Page<AdminProductResponse> getAllProducts(String search, Long categoryId, Pageable pageable) {
        Page<Product> products;

        if (search != null && !search.isEmpty() && categoryId != null) {
            products = productRepository.findByTitleContainingIgnoreCaseAndCategoryCategoryId(search, categoryId, pageable);
        } else if (search != null && !search.isEmpty()) {
            products = productRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryCategoryId(categoryId, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(this::convertToAdminProductResponse);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(productId);
    }

    @Transactional
    public void toggleProductBoost(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        boolean currentlyBoosted = Boolean.TRUE.equals(product.getIsBoosted());
        product.setIsBoosted(!currentlyBoosted);
        
        if (!currentlyBoosted) {
            product.setBoostExpiresAt(LocalDateTime.now().plusDays(7));
        } else {
            product.setBoostExpiresAt(null);
        }
        
        productRepository.save(product);
    }

    // ==================== ORDERS ====================

    public Page<AdminOrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders;

        if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return orders.map(this::convertToAdminOrderResponse);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    // ==================== REVIEWS ====================

    public Page<AdminReviewResponse> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::convertToAdminReviewResponse);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found");
        }
        reviewRepository.deleteById(reviewId);
    }

    // ==================== NOTIFICATIONS ====================

    @Transactional
    public void sendPlatformNotification(SendNotificationRequest request) {
        List<User> targetUsers;

        switch (request.getTarget().toUpperCase()) {
            case "BUYERS":
                targetUsers = userRepository.findByRole(Role.BUYER);
                break;
            case "SELLERS":
                targetUsers = userRepository.findByRole(Role.SELLER);
                break;
            case "ALL":
            default:
                targetUsers = userRepository.findAll();
                break;
        }

        for (User user : targetUsers) {
            Notification notification = new Notification();
            notification.setType(NotificationType.ORDER); // Using ORDER type for platform announcements
            notification.setAudience(
                "SELLERS".equalsIgnoreCase(request.getTarget()) 
                    ? NotificationAudience.SELLER 
                    : NotificationAudience.BUYER
            );
            notification.setTitle(request.getTitle());
            notification.setMessage(request.getMessage());
            notification.setUser(user);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    // ==================== CONVERTERS ====================

    private AdminUserResponse convertToAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .city(user.getCity())
                .profilePhoto(user.getProfilePhoto())
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .verificationBadge(user.getVerificationBadge())
                .createdAt(user.getCreatedAt())
                .totalProducts(productRepository.countBySellerUserId(user.getUserId()))
                .totalOrders(
                    user.getRole() == Role.SELLER
                        ? orderRepository.countBySellerUserId(user.getUserId())
                        : orderRepository.countByBuyerUserId(user.getUserId())
                )
                .followersCount(followRepository.countByFollowingUserId(user.getUserId()))
                .build();
    }

    private AdminProductResponse convertToAdminProductResponse(Product product) {
        String photoUrl = null;
        if (product.getMediaList() != null && !product.getMediaList().isEmpty()) {
            photoUrl = product.getMediaList().get(0).getUrl();
        }

        return AdminProductResponse.builder()
                .productId(product.getProductId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .status(product.getStatus())
                .viewsCount(product.getViewsCount())
                .isBoosted(product.getIsBoosted())
                .createdAt(product.getCreatedAt())
                .photoUrl(photoUrl)
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .sellerId(product.getSeller().getUserId())
                .sellerName(product.getSeller().getUserName())
                .sellerShopName(product.getSeller().getShopName())
                .likeCount(likeRepository.countByProductProductId(product.getProductId()))
                .reviewCount(reviewRepository.countByProductProductId(product.getProductId()))
                .orderCount(orderDetailRepository.getProductOrderCount(product.getProductId()))
                .build();
    }

    private AdminOrderResponse convertToAdminOrderResponse(Order order) {
        return AdminOrderResponse.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderDate(order.getOrderDate())
                .buyerId(order.getBuyer().getUserId())
                .buyerName(order.getBuyer().getUserName())
                .buyerEmail(order.getBuyer().getEmail())
                .sellerId(order.getSeller().getUserId())
                .sellerName(order.getSeller().getUserName())
                .sellerShopName(order.getSeller().getShopName())
                .itemCount(order.getOrderDetails() != null ? order.getOrderDetails().size() : 0)
                .build();
    }

    private AdminReviewResponse convertToAdminReviewResponse(Review review) {
        return AdminReviewResponse.builder()
                .reviewId(review.getReviewId())
                .rate(review.getRate())
                .comment(review.getComment())
                .date(review.getDate())
                .userId(review.getUser().getUserId())
                .userName(review.getUser().getUserName())
                .userPhoto(review.getUser().getProfilePhoto())
                .productId(review.getProduct().getProductId())
                .productTitle(review.getProduct().getTitle())
                .sellerId(review.getProduct().getSeller().getUserId())
                .sellerName(review.getProduct().getSeller().getUserName())
                .build();
    }
}
