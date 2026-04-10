package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find reviews for a product
    List<Review> findByProductProductId(Long productId);
    Page<Review> findByProductProductId(Long productId, Pageable pageable);
    
    // Find reviews by user
    List<Review> findByUserUserId(Long userId);
    
    // Find review by user and product (one user can only review once)
    Optional<Review> findByUserUserIdAndProductProductId(Long userId, Long productId);
    
    // Check if user already reviewed product
    boolean existsByUserUserIdAndProductProductId(Long userId, Long productId);
    
    // Count reviews for product
    long countByProductProductId(Long productId);
    
    // Get average rating for product
    @Query("SELECT COALESCE(AVG(r.rate), 0.0) FROM Review r WHERE r.product.productId = :productId")
    Double getAverageRating(@Param("productId") Long productId);
    
    // Find reviews by rating
    List<Review> findByProductProductIdAndRate(Long productId, Integer rate);
    
    // Get recent reviews for a product
    List<Review> findTop5ByProductProductIdOrderByDateDesc(Long productId);
}