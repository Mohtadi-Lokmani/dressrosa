package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    
    // Find all details for an order
    List<OrderDetail> findByOrderOrderId(Long orderId);
    
    // Find details by product
    List<OrderDetail> findByProductProductId(Long productId);
    
    // Count times a product was ordered
    @Query("SELECT COALESCE(SUM(od.quantity), 0) FROM OrderDetail od " +
           "WHERE od.product.productId = :productId")
    Integer getProductOrderCount(@Param("productId") Long productId);
}