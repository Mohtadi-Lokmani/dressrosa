package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Find all cart items for a user
    List<Cart> findByUserUserId(Long userId);
    
    // Find specific cart item
    Optional<Cart> findByUserUserIdAndProductProductIdAndVariantVariantId(
        Long userId, Long productId, Long variantId
    );
    
    // Check if item exists in cart
    boolean existsByUserUserIdAndProductProductIdAndVariantVariantId(
        Long userId, Long productId, Long variantId
    );
    
    // Count cart items for user
    long countByUserUserId(Long userId);
    
    // Delete all cart items for user
    void deleteByUserUserId(Long userId);
    
    // Get cart total (quantity sum)
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM Cart c WHERE c.user.userId = :userId")
    Integer getCartItemCount(@Param("userId") Long userId);
}