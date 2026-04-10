package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    
    // Find all variants for a product
    List<ProductVariant> findByProductProductId(Long productId);
    
    // Find variant by product, color, and size
    Optional<ProductVariant> findByProductProductIdAndColorAndSize(Long productId, String color, String size);
    
    // Find variants with stock > 0
    @Query("SELECT v FROM ProductVariant v WHERE v.product.productId = :productId AND v.quantity > 0")
    List<ProductVariant> findInStockVariants(@Param("productId") Long productId);
    
    // Check if product has any stock
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM ProductVariant v " +
           "WHERE v.product.productId = :productId AND v.quantity > 0")
    boolean hasStock(@Param("productId") Long productId);
    
    // Get total stock for a product
    @Query("SELECT COALESCE(SUM(v.quantity), 0) FROM ProductVariant v WHERE v.product.productId = :productId")
    Integer getTotalStock(@Param("productId") Long productId);
    
    // Delete all variants for a product
    void deleteByProductProductId(Long productId);
}