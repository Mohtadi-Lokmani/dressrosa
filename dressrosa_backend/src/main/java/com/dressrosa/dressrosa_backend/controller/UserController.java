package com.dressrosa.dressrosa_backend.controller;
import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.dto.user.*;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO user = userService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        UserDTO updated = userService.updateUser(currentUser.getUserId(), request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", updated);
        
        // If email changed, generate new token
        if (request.getEmail() != null && !request.getEmail().equals(email)) {
            String newToken = userService.generateNewToken(updated.getEmail());
            response.put("token", newToken);
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        userService.changePassword(currentUser.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        
        String photoUrl = userService.saveProfilePhoto(currentUser.getUserId(), file);
        
        Map<String, String> response = new HashMap<>();
        response.put("photoUrl", photoUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<SellerProfileDTO> getSellerProfile(@PathVariable Long sellerId) {
        SellerProfileDTO profile = userService.getSellerProfile(sellerId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/seller/dashboard")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerDashboardResponse> getSellerDashboard() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        SellerDashboardResponse dashboard = userService.getSellerDashboard(currentUser.getUserId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/buyer/dashboard")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<BuyerDashboardResponse> getBuyerDashboard() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        BuyerDashboardResponse dashboard = userService.getBuyerDashboard(currentUser.getUserId());
        return ResponseEntity.ok(dashboard);
    }
}