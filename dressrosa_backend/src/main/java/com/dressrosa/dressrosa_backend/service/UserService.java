package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.user.*;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private FollowRepository followRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    // @Autowired
    // private ReviewRepository reviewRepository;
    
    /**
     * GET USER BY ID
     * 
     * What it does:
     * - Fetch user from database by ID
     * - Convert User entity to UserDTO (hide password!)
     * 
     * @param userId - User ID to fetch
     * @return UserDTO with user details
     * @throws RuntimeException if user not found
     */
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToDTO(user);
    }
    
    /**
     * GET CURRENT USER
     * 
     * What it does:
     * - Get currently logged-in user from JWT token
     * - Return their profile info
     * 
     
     */
    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToDTO(user);
    }
    
    /**
     * UPDATE USER PROFILE
     * 
     * What it does:
     * - Update user's profile information
     * - Only updates fields that are provided (not null)
     * 
     * @param userId - User to update
     * @param request - New profile data
     * @return Updated UserDTO
     */
    public UserDTO updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update only if new value provided
        if (request.getUserName() != null) {
            user.setUserName(request.getUserName());
        }
        if (request.getTelephone() != null) {
            user.setTelephone(request.getTelephone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    /**
     * GET SELLER PROFILE (PUBLIC VIEW)
     * 
     * What it does:
     * - Get seller's public profile
     * - Include statistics (products, followers, ratings)
     * - This is what buyers see when viewing a seller
     * 
     * @param sellerId - Seller to view
     * @return SellerProfileDTO with stats
     */
    public SellerProfileDTO getSellerProfile(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        SellerProfileDTO dto = new SellerProfileDTO();
        dto.setUserId(seller.getUserId());
        dto.setUserName(seller.getUserName());
        dto.setProfilePhoto(seller.getProfilePhoto());
        dto.setBio(seller.getBio());
        dto.setVerificationBadge(seller.getVerificationBadge());
        dto.setCreatedAt(seller.getCreatedAt());
        
        // Add statistics
        dto.setTotalProducts(productRepository.countBySellerUserId(sellerId));
        dto.setFollowersCount(followRepository.countByFollowingUserId(sellerId));
        
        // Calculate average rating from all seller's products
        // This would require a custom query - simplified for now
        dto.setAverageRating(4.5); // TODO: Calculate from reviews
        
        return dto;
    }
    
    /**
     * GET SELLER DASHBOARD
     * 
     * What it does:
     * - Get comprehensive statistics for seller
     * - Shows products, views, followers, sales, orders
     * - Only accessible by the seller themselves
     * 
     * @param sellerId - Seller requesting dashboard
     * @return SellerDashboardResponse with all stats
     */
    public SellerDashboardResponse getSellerDashboard(Long sellerId) {
        SellerDashboardResponse dashboard = new SellerDashboardResponse();
        
        // Product stats
        dashboard.setTotalProducts(productRepository.countBySellerUserId(sellerId));
        // TODO: Add in-stock and sold-out counts
        
        // View stats (simplified - would need tracking)
        dashboard.setTotalViews(0); // TODO: Implement view tracking
        dashboard.setTodayViews(0);
        dashboard.setWeekViews(0);
        
        // Social stats
        dashboard.setFollowersCount(followRepository.countByFollowingUserId(sellerId));
        dashboard.setTotalLikes(0L); // TODO: Count likes on seller's products
        
        // Message stats
        dashboard.setUnreadMessages(0L); // TODO: Count unread messages
        dashboard.setTodayMessages(0L);
        
        // Sales stats
        dashboard.setTotalSales(orderRepository.getTotalSales(sellerId));
        dashboard.setCurrentMonthSales(orderRepository.getCurrentMonthSales(sellerId));
        
        // Order stats
        dashboard.setTotalOrders(orderRepository.countBySellerUserId(sellerId));
        dashboard.setPendingOrders(orderRepository.countBySellerUserIdAndStatus(sellerId, 
            com.dressrosa.dressrosa_backend.model.OrderStatus.PENDING));
        // TODO: Add other order status counts
        
        return dashboard;
    }
    
    /**
     * GET BUYER DASHBOARD
     * 
     * What it does:
     * - Get statistics for buyer
     * - Shows orders, saved products, likes, following
     * 
     * @param buyerId - Buyer requesting dashboard
     * @return BuyerDashboardResponse with stats
     */
    public BuyerDashboardResponse getBuyerDashboard(Long buyerId) {
        BuyerDashboardResponse dashboard = new BuyerDashboardResponse();
        
        // Order stats
        dashboard.setTotalOrders(orderRepository.countByBuyerUserId(buyerId));
        // TODO: Add order status counts
        
        // Social stats
        // TODO: Implement saved, liked, following counts
        
        return dashboard;
    }
    
    /**
     * CONVERT USER ENTITY TO DTO
     * 
     * What it does:
     * - Transform User entity to UserDTO
     * - Hides password and sensitive data
     * - Only includes data safe to send to frontend
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setAddress(user.getAddress());
        dto.setProfilePhoto(user.getProfilePhoto());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole());
        dto.setIsVerified(user.getIsVerified());
        dto.setVerificationBadge(user.getVerificationBadge());
        dto.setCreatedAt(user.getCreatedAt());
        
        return dto;
    }
}