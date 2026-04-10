package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
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