package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Order;
import com.dressrosa.dressrosa_backend.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by buyer
    List<Order> findByBuyerUserId(Long buyerId);
    Page<Order> findByBuyerUserId(Long buyerId, Pageable pageable);
    
    // Find orders by seller
    List<Order> findBySellerUserId(Long sellerId);
    Page<Order> findBySellerUserId(Long sellerId, Pageable pageable);
    
    // Find orders by buyer and status
    List<Order> findByBuyerUserIdAndStatus(Long buyerId, OrderStatus status);
    Page<Order> findByBuyerUserIdAndStatus(Long buyerId, OrderStatus status, Pageable pageable);
    
    // Find orders by seller and status
    List<Order> findBySellerUserIdAndStatus(Long sellerId, OrderStatus status);
    Page<Order> findBySellerUserIdAndStatus(Long sellerId, OrderStatus status, Pageable pageable);
    
    // Find orders by status
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    // Find recent orders
    List<Order> findTop10ByOrderByOrderDateDesc();
    
    // Count orders by buyer
    long countByBuyerUserId(Long buyerId);
    
    // Count orders by seller
    long countBySellerUserId(Long sellerId);
    
    // Count orders by seller and status
    long countBySellerUserIdAndStatus(Long sellerId, OrderStatus status);
    
    // Get seller's total sales
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.seller.userId = :sellerId AND o.status = 'DELIVERED'")
    java.math.BigDecimal getTotalSales(@Param("sellerId") Long sellerId);
    
    // Get seller's sales for current month
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.seller.userId = :sellerId " +
           "AND o.status = 'DELIVERED' " +
           "AND MONTH(o.orderDate) = MONTH(CURRENT_DATE) " +
           "AND YEAR(o.orderDate) = YEAR(CURRENT_DATE)")
    java.math.BigDecimal getCurrentMonthSales(@Param("sellerId") Long sellerId);
    
    // Find orders by date range
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find orders placed today
    @Query("SELECT o FROM Order o WHERE o.orderDate >= CURRENT_DATE")
    List<Order> findTodayOrders();

    // For aggregate charts: sum revenue per day
    @Query("SELECT CAST(o.orderDate AS date) as orderDay, SUM(o.totalAmount) as dailySum " +
           "FROM Order o " +
           "WHERE o.seller.userId = :sellerId AND o.status = 'DELIVERED' AND o.orderDate >= :since " +
           "GROUP BY CAST(o.orderDate AS date) " +
           "ORDER BY orderDay ASC")
    List<Object[]> findDailyRevenueForSeller(@Param("sellerId") Long sellerId, @Param("since") LocalDateTime since);

    // Platform-wide revenue (for admin dashboard)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal getPlatformTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status = 'DELIVERED' " +
           "AND MONTH(o.orderDate) = MONTH(CURRENT_DATE) " +
           "AND YEAR(o.orderDate) = YEAR(CURRENT_DATE)")
    java.math.BigDecimal getPlatformMonthRevenue();

    // Count orders after a date (for admin dashboard)
    long countByOrderDateAfter(LocalDateTime since);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderDetails od " +
           "WHERE o.buyer.userId = :userId AND od.product.productId = :productId AND o.status = 'DELIVERED'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}