package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.user.*;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.repository.*;
import com.dressrosa.dressrosa_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

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
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private static final String UPLOAD_DIR = "uploads/photos/";
    
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
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check email uniqueness
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getEmail());
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
     * Generate new JWT token for user (used after email change)
     */
    public String generateNewToken(String email) {
        return jwtUtil.generateToken(email);
    }
    
    /**
     * CHANGE PASSWORD
     */
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Encode and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    /**
     * SAVE PROFILE PHOTO
     */
    public String saveProfilePhoto(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create upload directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Update user profile photo URL
        String photoUrl = "/uploads/photos/" + filename;
        user.setProfilePhoto(photoUrl);
        userRepository.save(user);
        
        return photoUrl;
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
        dto.setFollowingCount(followRepository.countByFollowerUserId(sellerId));
        
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
        
        // Populate stats
        dto.setFollowersCount(followRepository.countByFollowingUserId(user.getUserId()));
        dto.setFollowingCount(followRepository.countByFollowerUserId(user.getUserId()));
        dto.setTotalProducts(productRepository.countBySellerUserId(user.getUserId()));
        
        return dto;
    }
}