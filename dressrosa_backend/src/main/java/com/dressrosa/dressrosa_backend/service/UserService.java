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
    
 
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToDTO(user);
    }
    
   
    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToDTO(user);
    }
    
   
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
    
   
    public String generateNewToken(String email) {
        return jwtUtil.generateToken(email);
    }
    
    
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
        dto.setAverageRating(4.5); 
        
        return dto;
    }
    
  
    public SellerDashboardResponse getSellerDashboard(Long sellerId) {
        SellerDashboardResponse dashboard = new SellerDashboardResponse();
        
        // Product stats
        dashboard.setTotalProducts(productRepository.countBySellerUserId(sellerId));
        dashboard.setTotalViews(0); 
        dashboard.setTodayViews(0);
        dashboard.setWeekViews(0);
        
        // Social stats
        dashboard.setFollowersCount(followRepository.countByFollowingUserId(sellerId));
        dashboard.setTotalLikes(0L);
        
        // Message stats
        dashboard.setUnreadMessages(0L); 
        dashboard.setTodayMessages(0L);
        
        // Sales stats
        dashboard.setTotalSales(orderRepository.getTotalSales(sellerId));
        dashboard.setCurrentMonthSales(orderRepository.getCurrentMonthSales(sellerId));
        
        // Order stats
        dashboard.setTotalOrders(orderRepository.countBySellerUserId(sellerId));
        dashboard.setPendingOrders(orderRepository.countBySellerUserIdAndStatus(sellerId, 
            com.dressrosa.dressrosa_backend.model.OrderStatus.PENDING));
      
        
        return dashboard;
    }
  
    public BuyerDashboardResponse getBuyerDashboard(Long buyerId) {
        BuyerDashboardResponse dashboard = new BuyerDashboardResponse();
        
        // Order stats
        dashboard.setTotalOrders(orderRepository.countByBuyerUserId(buyerId));
       
        
        return dashboard;
    }
    
  
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