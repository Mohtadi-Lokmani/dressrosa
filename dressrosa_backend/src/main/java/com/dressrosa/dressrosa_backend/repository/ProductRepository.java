package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Product;
import com.dressrosa.dressrosa_backend.model.ProductStatus;
import com.dressrosa.dressrosa_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find products by seller
    List<Product> findBySeller(User seller);
    Page<Product> findBySeller(User seller, Pageable pageable);
    
    // Find products by seller ID
    List<Product> findBySellerUserId(Long sellerId);
    Page<Product> findBySellerUserId(Long sellerId, Pageable pageable);
    
    // Find products from a list of sellers
    Page<Product> findBySellerUserIdInAndStatus(Collection<Long> sellerIds, ProductStatus status, Pageable pageable);
    
    // Find products by status
    List<Product> findByStatus(ProductStatus status);
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    
    // Find IN_STOCK products only
    @Query("SELECT p FROM Product p WHERE p.status = 'IN_STOCK' ORDER BY p.isBoosted DESC, p.createdAt DESC")
    Page<Product> findAllInStock(Pageable pageable);
    
    // Find products by category
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);
    
    // Find products by category and status
    Page<Product> findByCategoryCategoryIdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);
    
    // Search products by title
    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Search products by title with status filter
    Page<Product> findByTitleContainingIgnoreCaseAndStatus(String title, ProductStatus status, Pageable pageable);
    
    // Find products by price range
    Page<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    // Find products by price range and status
    Page<Product> findByPriceBetweenAndStatus(BigDecimal minPrice, BigDecimal maxPrice, ProductStatus status, Pageable pageable);
    
    // Find boosted products
    List<Product> findByIsBoostedTrue();
    Page<Product> findByIsBoostedTrue(Pageable pageable);
    
    // Complex search query
    @Query("SELECT p FROM Product p " +
           "WHERE (:categoryId IS NULL OR p.category.categoryId = :categoryId) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY p.isBoosted DESC, p.createdAt DESC")
    Page<Product> searchProducts(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        @Param("status") ProductStatus status,
        Pageable pageable
    );
    
    // Count products by seller
    long countBySellerUserId(Long sellerId);
    
    // Get most viewed products
    Page<Product> findByStatusOrderByViewsCountDesc(ProductStatus status, Pageable pageable);
    
    // Get newest products
    Page<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
}