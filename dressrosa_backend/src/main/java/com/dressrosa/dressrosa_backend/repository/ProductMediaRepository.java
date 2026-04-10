package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.MediaType;
import com.dressrosa.dressrosa_backend.model.ProductMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, Long> {
    
    // Find all media for a product
    List<ProductMedia> findByProductProductId(Long productId);
    
    // Find media by type for a product
    List<ProductMedia> findByProductProductIdAndType(Long productId, MediaType type);
    
    // Count media for a product
    long countByProductProductId(Long productId);
    
    // Delete all media for a product
    void deleteByProductProductId(Long productId);
}