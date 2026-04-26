package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.dto.product.ProductListResponse;
import com.dressrosa.dressrosa_backend.dto.social.ReviewRequest;
import com.dressrosa.dressrosa_backend.dto.social.ReviewResponse;
import com.dressrosa.dressrosa_backend.dto.user.SellerProfileDTO;
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
public class SocialService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private SavedRepository savedRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private FollowRepository followRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ProductMediaRepository productMediaRepository;
    
   
    @Transactional
    public ApiResponse likeProduct(Long productId, Long userId) {
        // Check if already liked
        if (likeRepository.existsByUserUserIdAndProductProductId(userId, productId)) {
            return ApiResponse.success("Already liked");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Create like
        Like like = new Like();
        like.setUser(user);
        like.setProduct(product);
        likeRepository.save(like);
        
        // Notify seller (don't notify if seller likes their own product)
        if (!product.getSeller().getUserId().equals(userId)) {
            notificationService.createNotification(
                product.getSeller().getUserId(),
                NotificationType.LIKE,
                NotificationAudience.SELLER,
                "New Like",
                user.getUserName() + " liked your product: " + product.getTitle(),
                productId
            );
        }
        
        return ApiResponse.success("Product liked");
    }
    
   
    @Transactional
    public ApiResponse unlikeProduct(Long productId, Long userId) {
        likeRepository.deleteByUserUserIdAndProductProductId(userId, productId);
        return ApiResponse.success("Product unliked");
    }
    
    
    public boolean hasLiked(Long productId, Long userId) {
        return likeRepository.existsByUserUserIdAndProductProductId(userId, productId);
    }
    
    
    public Page<ProductListResponse> getLikedProducts(Long userId, Pageable pageable) {
        Page<Product> products = likeRepository.findLikedProductsByUserId(userId, pageable);
        return products.map(this::convertToListResponse);
    }
    
  
   
    @Transactional
    public ApiResponse saveProduct(Long productId, Long userId) {
        // Check if already saved
        if (savedRepository.existsByUserUserIdAndProductProductId(userId, productId)) {
            return ApiResponse.success("Already saved");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Create saved item
        Saved saved = new Saved();
        saved.setUser(user);
        saved.setProduct(product);
        savedRepository.save(saved);
        
        return ApiResponse.success("Product saved");
    }
    
   
    @Transactional
    public ApiResponse unsaveProduct(Long productId, Long userId) {
        savedRepository.deleteByUserUserIdAndProductProductId(userId, productId);
        return ApiResponse.success("Product removed from saved");
    }
   
    public boolean hasSaved(Long productId, Long userId) {
        return savedRepository.existsByUserUserIdAndProductProductId(userId, productId);
    }
    
   
    public Page<ProductListResponse> getSavedProducts(Long userId, Pageable pageable) {
        Page<Product> products = savedRepository.findSavedProductsByUserId(userId, pageable);
        return products.map(this::convertToListResponse);
    }
    
    
    @Transactional
    public ReviewResponse addReview(ReviewRequest request, Long userId) {
        // Check if already reviewed
        if (reviewRepository.existsByUserUserIdAndProductProductId(
            userId, request.getProductId())) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Validate rating
        if (request.getRate() < 1 || request.getRate() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        // TODO: Verify user bought this product
        // (Would check if user has a DELIVERED order containing this product)
        
        // Create review
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRate(request.getRate());
        review.setComment(request.getComment());
        
        Review savedReview = reviewRepository.save(review);
        
        // Notify seller
        notificationService.createNotification(
            product.getSeller().getUserId(),
            NotificationType.REVIEW,
            NotificationAudience.SELLER,
            "New Review",
            user.getUserName() + " reviewed " + product.getTitle() + 
            " - " + request.getRate() + " stars",
            product.getProductId()
        );
        
        return convertReviewToResponse(savedReview);
    }
    
 
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductProductId(productId, pageable);
        return reviews.map(this::convertReviewToResponse);
    }
    
   
    public List<ReviewResponse> getUserReviews(Long userId) {
        List<Review> reviews = reviewRepository.findByUserUserId(userId);
        return reviews.stream()
                .map(this::convertReviewToResponse)
                .collect(Collectors.toList());
    }
    
   
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check authorization
        if (!review.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }
    
   
    @Transactional
    public ApiResponse followSeller(Long sellerId, Long userId) {
        // Can't follow yourself
        if (sellerId.equals(userId)) {
            throw new RuntimeException("You cannot follow yourself");
        }
        
        // Check if already following
        if (followRepository.existsByFollowerUserIdAndFollowingUserId(userId, sellerId)) {
            return ApiResponse.success("Already following");
        }
        
        User follower = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User following = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        // Create follow relationship
        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepository.save(follow);
        
        // Notify seller
        notificationService.createNotification(
            sellerId,
            NotificationType.FOLLOW,
            NotificationAudience.SELLER,
            "New Follower",
            follower.getUserName() + " started following you",
            userId
        );
        
        return ApiResponse.success("Now following " + following.getUserName());
    }
    
    
    @Transactional
    public ApiResponse unfollowSeller(Long sellerId, Long userId) {
        followRepository.deleteByFollowerUserIdAndFollowingUserId(userId, sellerId);
        return ApiResponse.success("Unfollowed");
    }
    
    
    public boolean isFollowing(Long sellerId, Long userId) {
        return followRepository.existsByFollowerUserIdAndFollowingUserId(userId, sellerId);
    }
    
  
    public List<SellerProfileDTO> getFollowers(Long sellerId) {
        List<Follow> follows = followRepository.findByFollowingUserId(sellerId);
        return follows.stream()
                .map(follow -> convertUserToSellerProfile(follow.getFollower()))
                .collect(Collectors.toList());
    }
    
   
    public List<SellerProfileDTO> getFollowing(Long userId) {
        List<Follow> follows = followRepository.findByFollowerUserId(userId);
        return follows.stream()
                .map(follow -> convertUserToSellerProfile(follow.getFollowing()))
                .collect(Collectors.toList());
    }
    
   
    
    private ReviewResponse convertReviewToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setReviewId(review.getReviewId());
        response.setRate(review.getRate());
        response.setComment(review.getComment());
        response.setDate(review.getDate());
        
        // User info
        response.setUserId(review.getUser().getUserId());
        response.setUserName(review.getUser().getUserName());
        response.setUserPhoto(review.getUser().getProfilePhoto());
        
        // Product info
        response.setProductId(review.getProduct().getProductId());
        response.setProductTitle(review.getProduct().getTitle());
        
        return response;
    }
    
    private SellerProfileDTO convertUserToSellerProfile(User user) {
        SellerProfileDTO dto = new SellerProfileDTO();
        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setProfilePhoto(user.getProfilePhoto());
        dto.setBio(user.getBio());
        dto.setVerificationBadge(user.getVerificationBadge());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Add stats
        dto.setFollowersCount(followRepository.countByFollowingUserId(user.getUserId()));
        dto.setTotalProducts(productRepository.countBySellerUserId(user.getUserId()));
        dto.setAverageRating(4.5); // TODO: Calculate from reviews
        
        return dto;
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
        
        // Seller
        response.setSellerId(product.getSeller().getUserId());
        response.setSellerName(product.getSeller().getUserName());
        response.setSellerVerified(product.getSeller().getVerificationBadge());
        
        // Quick stats
        response.setLikesCount((long) likeRepository.countByProductProductId(product.getProductId()));
        response.setAverageRating(reviewRepository.getAverageRating(product.getProductId()));
        
        return response;
    }
}