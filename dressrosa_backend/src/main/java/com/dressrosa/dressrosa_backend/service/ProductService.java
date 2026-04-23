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
    
    @Autowired
    private FollowRepository followRepository;
    
   
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
    
    
    @Transactional
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Increment view count
        product.setViewsCount(product.getViewsCount() + 1);
        productRepository.save(product);
        
        return convertToResponse(product);
    }
    
    
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
    
    
    public Page<ProductListResponse> getSellerProducts(Long sellerId, Pageable pageable) {
        Page<Product> products = productRepository.findBySellerUserId(sellerId, pageable);
        return products.map(this::convertToListResponse);
    }
    
   
    public Page<ProductListResponse> getFollowingProducts(Long followerId, Pageable pageable) {
        // Find which users this person is following
        List<Follow> follows = followRepository.findByFollowerUserId(followerId);
        
        if (follows.isEmpty()) {
            return Page.empty(pageable);
        }
        
        // Extract seller IDs
        List<Long> followedSellerIds = follows.stream()
            .map(f -> f.getFollowing().getUserId())
            .collect(Collectors.toList());
            
        // Fetch products from these sellers
        Page<Product> products = productRepository.findBySellerUserIdInAndStatus(
            followedSellerIds, ProductStatus.IN_STOCK, pageable
        );
        
        return products.map(this::convertToListResponse);
    }
    
   
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
        
        // Set unified media list for frontend
        response.setMedia(media.stream()
            .map(m -> new ProductMediaDTO(m.getUrl(), m.getType()))
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
        
        // Set unified media list for frontend
        response.setMedia(media.stream()
            .map(m -> new ProductMediaDTO(m.getUrl(), m.getType()))
            .collect(Collectors.toList()));
        
        // Seller
        response.setSellerId(product.getSeller().getUserId());
        response.setSellerName(product.getSeller().getUserName());
        response.setSellerVerified(product.getSeller().getVerificationBadge());
        
        // Variants (for filtering in Shop page)
        List<ProductVariant> variants = productVariantRepository.findByProductProductId(product.getProductId());
        response.setVariants(variants.stream()
            .map(this::convertVariantToResponse)
            .collect(Collectors.toList()));
        
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