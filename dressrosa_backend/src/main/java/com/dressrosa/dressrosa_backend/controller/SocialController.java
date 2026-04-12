package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.dto.social.ReviewRequest;
import com.dressrosa.dressrosa_backend.dto.social.ReviewResponse;
import com.dressrosa.dressrosa_backend.dto.user.SellerProfileDTO;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.SocialService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "*")
public class SocialController {
    
    @Autowired
    private SocialService socialService;
    
    @Autowired
    private UserService userService;
    
  
    @PostMapping("/like/{productId}")
    public ResponseEntity<ApiResponse> likeProduct(@PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ApiResponse response = socialService.likeProduct(productId, currentUser.getUserId());
        return ResponseEntity.ok(response);
    }
    
  
    @DeleteMapping("/like/{productId}")
    public ResponseEntity<ApiResponse> unlikeProduct(@PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ApiResponse response = socialService.unlikeProduct(productId, currentUser.getUserId());
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/like/{productId}/check")
    public ResponseEntity<Boolean> hasLiked(@PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        boolean liked = socialService.hasLiked(productId, currentUser.getUserId());
        return ResponseEntity.ok(liked);
    }
    
    @GetMapping("/like/my-likes")
    public ResponseEntity<Page<com.dressrosa.dressrosa_backend.dto.product.ProductListResponse>> getMyLikes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("likedAt").descending());
        Page<com.dressrosa.dressrosa_backend.dto.product.ProductListResponse> products = socialService.getLikedProducts(currentUser.getUserId(), pageable);
        
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/save/{productId}")
    public ResponseEntity<ApiResponse> saveProduct(@PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ApiResponse response = socialService.saveProduct(productId, currentUser.getUserId());
        return ResponseEntity.ok(response);
    }
    
  
    @DeleteMapping("/save/{productId}")
    public ResponseEntity<ApiResponse> unsaveProduct(@PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ApiResponse response = socialService.unsaveProduct(productId, currentUser.getUserId());
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/save/{productId}/check")
    public ResponseEntity<Boolean> hasSaved(@PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        boolean saved = socialService.hasSaved(productId, currentUser.getUserId());
        return ResponseEntity.ok(saved);
    }
    
    @GetMapping("/save/my-saved")
    public ResponseEntity<Page<com.dressrosa.dressrosa_backend.dto.product.ProductListResponse>> getMySaved(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("savedAt").descending());
        Page<com.dressrosa.dressrosa_backend.dto.product.ProductListResponse> products = socialService.getSavedProducts(currentUser.getUserId(), pageable);
        
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> addReview(@Valid @RequestBody ReviewRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ReviewResponse review = socialService.addReview(request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
   
    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<ReviewResponse> reviews = socialService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(reviews);
    }
    
  
    @GetMapping("/reviews/my-reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        List<ReviewResponse> reviews = socialService.getUserReviews(currentUser.getUserId());
        return ResponseEntity.ok(reviews);
    }
   
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long reviewId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        socialService.deleteReview(reviewId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }
    
   
    @PostMapping("/follow/{sellerId}")
    public ResponseEntity<ApiResponse> followSeller(@PathVariable Long sellerId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ApiResponse response = socialService.followSeller(sellerId, currentUser.getUserId());
        return ResponseEntity.ok(response);
    }
 
    @DeleteMapping("/follow/{sellerId}")
    public ResponseEntity<ApiResponse> unfollowSeller(@PathVariable Long sellerId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ApiResponse response = socialService.unfollowSeller(sellerId, currentUser.getUserId());
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/follow/{sellerId}/check")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long sellerId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        boolean following = socialService.isFollowing(sellerId, currentUser.getUserId());
        return ResponseEntity.ok(following);
    }
    
    
    @GetMapping("/follow/{sellerId}/followers")
    public ResponseEntity<List<SellerProfileDTO>> getFollowers(@PathVariable Long sellerId) {
        List<SellerProfileDTO> followers = socialService.getFollowers(sellerId);
        return ResponseEntity.ok(followers);
    }
    
   
    @GetMapping("/follow/my-following")
    public ResponseEntity<List<SellerProfileDTO>> getMyFollowing() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        List<SellerProfileDTO> following = socialService.getFollowing(currentUser.getUserId());
        return ResponseEntity.ok(following);
    }
}