package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.user.*;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.model.ProductView;
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
    private ProductViewRepository productViewRepository;


    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
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
        if (request.getBannerImage() != null) {
            user.setBannerImage(request.getBannerImage());
        }
        if (request.getOpeningHours() != null) {
            user.setOpeningHours(request.getOpeningHours());
        }
        if (request.getAutoReplyMessage() != null) {
            user.setAutoReplyMessage(request.getAutoReplyMessage());
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
        
        String photoUrl = saveFile(file, "profile_");
        user.setProfilePhoto(photoUrl);
        userRepository.save(user);
        return photoUrl;
    }

    public String saveBannerImage(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String bannerUrl = saveFile(file, "banner_");
        user.setBannerImage(bannerUrl);
        userRepository.save(user);
        return bannerUrl;
    }

    private String saveFile(MultipartFile file, String prefix) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = prefix + UUID.randomUUID().toString() + extension;
        
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return "/uploads/photos/" + filename;
    }
  
    public java.util.List<UserDTO> getAllSellers(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<User> sellersPage = userRepository.findByRole(com.dressrosa.dressrosa_backend.model.Role.SELLER, pageable);
        return sellersPage.getContent().stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList());
    }

    public SellerProfileDTO getSellerProfile(Long sellerId, Long viewerId, String ipAddress) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        SellerProfileDTO dto = new SellerProfileDTO();
        dto.setUserId(seller.getUserId());
        dto.setUserName(seller.getUserName());
        dto.setProfilePhoto(seller.getProfilePhoto());
        dto.setBio(seller.getBio());
        dto.setBannerImage(seller.getBannerImage());
        dto.setVerificationBadge(seller.getVerificationBadge());
        dto.setCreatedAt(seller.getCreatedAt());
        
        // Add statistics
        dto.setTotalProducts(productRepository.countBySellerUserId(sellerId));
        dto.setFollowersCount(followRepository.countByFollowingUserId(sellerId));
        dto.setFollowingCount(followRepository.countByFollowerUserId(sellerId));
        dto.setAverageRating(reviewRepository.getAverageRatingForSeller(sellerId));
        dto.setOrdersCompleted(orderRepository.countBySellerUserIdAndStatus(sellerId, com.dressrosa.dressrosa_backend.model.OrderStatus.DELIVERED));
        
        // Track view logic removed        
        return dto;
    }
    
  
    public SellerDashboardResponse getSellerDashboard(Long sellerId) {
        SellerDashboardResponse dashboard = new SellerDashboardResponse();
        java.time.LocalDateTime startOfToday = java.time.LocalDate.now().atStartOfDay();
        java.time.LocalDateTime startOfWeek = java.time.LocalDate.now().minusDays(7).atStartOfDay();

        // Product stats
        dashboard.setTotalProducts(productRepository.countBySellerUserId(sellerId));
        dashboard.setTotalViews((int) productViewRepository.countBySellerId(sellerId)); 
        dashboard.setTodayViews((int) productViewRepository.countBySellerIdAndRecent(sellerId, startOfToday));
        dashboard.setWeekViews((int) productViewRepository.countBySellerIdAndRecent(sellerId, startOfWeek));
        
        // Social stats
        dashboard.setFollowersCount(followRepository.countByFollowingUserId(sellerId));
        dashboard.setTotalLikes(0L); // Needs LikeRepository count by seller
        
        // Message stats
        dashboard.setUnreadMessages(0L); 
        dashboard.setTodayMessages(0L);
        
        // Sales stats
        java.math.BigDecimal totalSales = orderRepository.getTotalSales(sellerId);
        java.math.BigDecimal monthSales = orderRepository.getCurrentMonthSales(sellerId);
        dashboard.setTotalSales(totalSales != null ? totalSales.longValue() : 0L);
        dashboard.setCurrentMonthSales(monthSales != null ? monthSales.longValue() : 0L);
        
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
        
        // Activity stats
        dashboard.setReviewsGiven(reviewRepository.countByUserUserId(buyerId));
        
        return dashboard;
    }
    
  
    public StudioTodoResponse getStudioTodo(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        java.util.List<StudioTodoResponse.TodoItem> items = new java.util.ArrayList<>();
        
        // 1. Profile Completion Check
        if (seller.getBannerImage() == null || seller.getProfilePhoto() == null) {
            items.add(StudioTodoResponse.TodoItem.builder()
                .id("setup_photos")
                .title("Visualise Your Atelier")
                .description("Add a profile photo and banner to attract more customers.")
                .type("SETUP")
                .priority("HIGH")
                .actionUrl("/studio/profile/edit")
                .build());
        }
        
        if (seller.getBio() == null || seller.getBio().isEmpty()) {
            items.add(StudioTodoResponse.TodoItem.builder()
                .id("setup_bio")
                .title("Tell Your Story")
                .description("Write a short bio about your atelier.")
                .type("SETUP")
                .priority("MEDIUM")
                .actionUrl("/studio/profile/edit")
                .build());
        }
        
        // 2. Orders Check
        long pendingOrders = orderRepository.countBySellerUserIdAndStatus(sellerId, 
            com.dressrosa.dressrosa_backend.model.OrderStatus.PENDING);
        if (pendingOrders > 0) {
            items.add(StudioTodoResponse.TodoItem.builder()
                .id("pending_orders")
                .title(pendingOrders + " Pending Orders")
                .description("You have orders waiting to be processed.")
                .type("ORDER")
                .priority("HIGH")
                .actionUrl("/studio/orders")
                .build());
        }
        
        // 2b. Unread Messages
        long unreadMessages = messageRepository.countByReceiverUserIdAndIsReadFalse(sellerId);
        if (unreadMessages > 0) {
            items.add(StudioTodoResponse.TodoItem.builder()
                .id("unread_messages")
                .title(unreadMessages + " Unread Messages")
                .description("Buyers are waiting for your response.")
                .type("MESSAGE")
                .priority("MEDIUM")
                .actionUrl("/studio/messages")
                .build());
        }
        
        // 3. Growth Suggestion
        long boostedCount = productRepository.findByIsBoostedTrue().stream()
            .filter(p -> p.getSeller().getUserId().equals(sellerId))
            .count();
        if (boostedCount == 0) {
            items.add(StudioTodoResponse.TodoItem.builder()
                .id("boost_suggestion")
                .title("Grow Your Influence")
                .description("Try boosting your first product to reach 3x more buyers.")
                .type("SETUP")
                .priority("MEDIUM")
                .actionUrl("/studio/boost")
                .build());
        }
        
        return new StudioTodoResponse(items);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setAddress(user.getAddress());
        dto.setProfilePhoto(user.getProfilePhoto());
        dto.setBannerImage(user.getBannerImage());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole());
        dto.setIsVerified(user.getIsVerified());
        dto.setVerificationBadge(user.getVerificationBadge());
        dto.setOpeningHours(user.getOpeningHours());
        dto.setAutoReplyMessage(user.getAutoReplyMessage());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Populate stats
        dto.setFollowersCount(followRepository.countByFollowingUserId(user.getUserId()));
        dto.setFollowingCount(followRepository.countByFollowerUserId(user.getUserId()));
        dto.setTotalProducts(productRepository.countBySellerUserId(user.getUserId()));
        
        return dto;
    }
}