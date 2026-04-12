package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Saved;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedRepository extends JpaRepository<Saved, Long> {
    
    // Find all saved products for a user
    List<Saved> findByUserUserId(Long userId);
    Page<Saved> findByUserUserId(Long userId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT s.product FROM Saved s WHERE s.user.userId = :userId ORDER BY s.savedAt DESC")
    Page<com.dressrosa.dressrosa_backend.model.Product> findSavedProductsByUserId(@org.springframework.data.repository.query.Param("userId") Long userId, Pageable pageable);
    
    // Find specific saved item
    Optional<Saved> findByUserUserIdAndProductProductId(Long userId, Long productId);
    
    // Check if user saved product
    boolean existsByUserUserIdAndProductProductId(Long userId, Long productId);
    
    // Count saved products for user
    long countByUserUserId(Long userId);
    
    // Count how many users saved a product
    long countByProductProductId(Long productId);
    
    // Delete saved item
    void deleteByUserUserIdAndProductProductId(Long userId, Long productId);
}