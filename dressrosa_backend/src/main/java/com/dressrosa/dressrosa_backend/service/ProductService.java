package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.product.*;
import com.dressrosa.dressrosa_backend.model.*;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductMediaRepository productMediaRepository;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private SavedRepository savedRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    /**
     * CREATE NEW PRODUCT
     * 
     * What it does:
     * 1. Create product with basic info (title, price, description)
     * 2. Link to category
     * 3. Add media files (images/videos)
     * 4. Add variants (sizes/colors with stock)
     * 5. Calculate initial stock status
     * 
     * @param request - Product data
     * @param sellerId - Who is creating this product
     * @return ProductResponse with full details
     * 
     * @Transactional - If anything fails, rollback everything
     */
    @Transactional
    public ProductResponse createProduct(ProductRequest request, Long sellerId) {
        // Find seller
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        // Find category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Create product
        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setSeller(seller);
        product.setStatus(ProductStatus.IN_STOCK);  // Default status
        product.setViewsCount(0);
        product.setIsBoosted(false);
        
        // Save product first (to get ID)
        Product savedProduct = productRepository.save(product);
        
        // Add media files (images/videos)
        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                ProductMedia media = new ProductMedia();
                media.setProduct(savedProduct);
                media.setType(MediaType.IMAGE);
                media.setUrl(url);
                productMediaRepository.save(media);
            }
        }
        
        if (request.getVideoUrls() != null) {
            for (String url : request.getVideoUrls()) {
                ProductMedia media = new ProductMedia();
                media.setProduct(savedProduct);
                media.setType(MediaType.VIDEO);
                media.setUrl(url);
                productMediaRepository.save(media);
            }
        }
        
        // Add variants (sizes/colors)
        if (request.getVariants() != null) {
            for (ProductVariantRequest variantReq : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(savedProduct);
                variant.setColor(variantReq.getColor());
                variant.setSize(variantReq.getSize());
                variant.setQuantity(variantReq.getQuantity());
                productVariantRepository.save(variant);
            }
            
            // Check if all variants are out of stock
            boolean hasStock = productVariantRepository.hasStock(savedProduct.getProductId());
            savedProduct.setStatus(hasStock ? ProductStatus.IN_STOCK : ProductStatus.SOLD_OUT);
            productRepository.save(savedProduct);
        }
        
        return convertToResponse(savedProduct);
    }
    
    /**
     * GET PRODUCT BY ID
     * 
     * What it does:
     * - Fetch product details
     * - Increment view counter
     * - Include media, variants, statistics
     * 
     * @param productId - Product to fetch
     * @return ProductResponse with full details
     */
    @Transactional
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Increment view count
        product.setViewsCount(product.getViewsCount() + 1);
        productRepository.save(product);
        
        return convertToResponse(product);
    }
    
    /**
     * GET ALL PRODUCTS (WITH FILTERS)
     * 
     * What it does:
     * - List all products
     * - Filter by category, price, status, search term
     * - Paginated results (20 per page)
     * - Sort by newest, price, views, etc.
     * 
     * @param categoryId - Filter by category (optional)
     * @param minPrice - Minimum price (optional)
     * @param maxPrice - Maximum price (optional)
     * @param searchTerm - Search in title (optional)
     * @param pageable - Page number, size, sort
     * @return Page of products
     */
    public Page<ProductListResponse> getAllProducts(
            Long categoryId, 
            java.math.BigDecimal minPrice, 
            java.math.BigDecimal maxPrice, 
            String searchTerm, 
            Pageable pageable) {
        
        Page<Product> productsPage = productRepository.searchProducts(
            categoryId, minPrice, maxPrice, searchTerm, ProductStatus.IN_STOCK, pageable
        );
        
        return productsPage.map(this::convertToListResponse);
    }
    
    /**
     * GET SELLER'S PRODUCTS
     * 
     * What it does:
     * - Fetch all products from a specific seller
     * - Used in seller profile page
     * 
     * @param sellerId - Seller ID
     * @param pageable - Pagination
     * @return Page of products
     */
    public Page<ProductListResponse> getSellerProducts(Long sellerId, Pageable pageable) {
        Page<Product> products = productRepository.findBySellerUserId(sellerId, pageable);
        return products.map(this::convertToListResponse);
    }
    
    /**
     * UPDATE PRODUCT
     * 
     * What it does:
     * - Update product details
     * - Only seller who created it can update
     * - Update variants and media if provided
     * 
     * @param productId - Product to update
     * @param request - New data
     * @param sellerId - Who is updating (must be owner)
     * @return Updated product
     */
    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest request, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check ownership
        if (!product.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("You can only update your own products");
        }
        
        // Update fields
        if (request.getTitle() != null) {
            product.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        
        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }
    
    /**
     * DELETE PRODUCT
     * 
     * What it does:
     * - Remove product from database
     * - Cascade delete: media, variants, likes, saves all deleted too
     * - Only seller who created it can delete
     * 
     * @param productId - Product to delete
     * @param sellerId - Who is deleting (must be owner)
     */
    @Transactional
    public void deleteProduct(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check ownership
        if (!product.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("You can only delete your own products");
        }
        
        productRepository.delete(product);
    }
    
    /**
     * CONVERT PRODUCT ENTITY TO FULL RESPONSE
     * 
     * What it does:
     * - Transform Product → ProductResponse
     * - Include all related data (media, variants, stats)
     * - Calculate likes, saves, ratings
     */
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        
        // Basic info
        response.setProductId(product.getProductId());
        response.setTitle(product.getTitle());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStatus(product.getStatus());
        response.setViewsCount(product.getViewsCount());
        response.setIsBoosted(product.getIsBoosted());
        response.setCreatedAt(product.getCreatedAt());
        
        // Category
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getCategoryId());
            response.setCategoryName(product.getCategory().getName());
        }
        
        // Seller
        response.setSellerId(product.getSeller().getUserId());
        response.setSellerName(product.getSeller().getUserName());
        response.setSellerVerified(product.getSeller().getVerificationBadge());
        
        // Media
        List<ProductMedia> media = productMediaRepository.findByProductProductId(product.getProductId());
        response.setImageUrls(media.stream()
            .filter(m -> m.getType() == MediaType.IMAGE)
            .map(ProductMedia::getUrl)
            .collect(Collectors.toList()));
        response.setVideoUrls(media.stream()
            .filter(m -> m.getType() == MediaType.VIDEO)
            .map(ProductMedia::getUrl)
            .collect(Collectors.toList()));
        
        // Variants
        List<ProductVariant> variants = productVariantRepository.findByProductProductId(product.getProductId());
        response.setVariants(variants.stream()
            .map(this::convertVariantToResponse)
            .collect(Collectors.toList()));
        
        // Statistics
        response.setLikesCount(likeRepository.countByProductProductId(product.getProductId()));
        response.setSavesCount(savedRepository.countByProductProductId(product.getProductId()));
        response.setAverageRating(reviewRepository.getAverageRating(product.getProductId()));
        response.setReviewsCount(reviewRepository.countByProductProductId(product.getProductId()));
        
        return response;
    }
    
    /**
     * CONVERT PRODUCT TO LIST RESPONSE (LIGHTER VERSION)
     * 
     * What it does:
     * - Simpler version for product lists
     * - Only essential info (title, price, first image)
     * - Faster because less data to fetch
     */
    private ProductListResponse convertToListResponse(Product product) {
        ProductListResponse response = new ProductListResponse();
        
        response.setProductId(product.getProductId());
        response.setTitle(product.getTitle());
        response.setPrice(product.getPrice());
        response.setStatus(product.getStatus());
        response.setViewsCount(product.getViewsCount());
        response.setIsBoosted(product.getIsBoosted());
        response.setCreatedAt(product.getCreatedAt());
        
        // First image only
        List<ProductMedia> media = productMediaRepository.findByProductProductId(product.getProductId());
        if (!media.isEmpty()) {
            response.setImageUrl(media.get(0).getUrl());
        }
        
        // Seller
        response.setSellerId(product.getSeller().getUserId());
        response.setSellerName(product.getSeller().getUserName());
        response.setSellerVerified(product.getSeller().getVerificationBadge());
        
        // Quick stats
        response.setLikesCount(likeRepository.countByProductProductId(product.getProductId()));
        response.setAverageRating(reviewRepository.getAverageRating(product.getProductId()));
        
        return response;
    }
    
    private ProductVariantResponse convertVariantToResponse(ProductVariant variant) {
        ProductVariantResponse response = new ProductVariantResponse();
        response.setVariantId(variant.getVariantId());
        response.setColor(variant.getColor());
        response.setSize(variant.getSize());
        response.setQuantity(variant.getQuantity());
        return response;
    }
}