package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.dressrosa.dressrosa_backend.model.Product;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    // Find all liked products by user
    @Query("SELECT l.product FROM Like l WHERE l.user.userId = :userId ORDER BY l.likedAt DESC")
    Page<Product> findLikedProductsByUserId(@Param("userId") Long userId, Pageable pageable);
    
    // Find all likes by user
    List<Like> findByUserUserId(Long userId);
    
    // Find all likes for a product
    List<Like> findByProductProductId(Long productId);
    
    // Find specific like
    Optional<Like> findByUserUserIdAndProductProductId(Long userId, Long productId);
    
    // Check if user liked product
    boolean existsByUserUserIdAndProductProductId(Long userId, Long productId);
    
    // Count likes for product
    long countByProductProductId(Long productId);
    
    // Delete like
    void deleteByUserUserIdAndProductProductId(Long userId, Long productId);
}