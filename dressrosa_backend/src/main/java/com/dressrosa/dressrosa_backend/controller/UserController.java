package com.dressrosa.dressrosa_backend.controller;
import com.dressrosa.dressrosa_backend.dto.user.*;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        UserDTO updated = userService.updateUser(currentUser.getUserId(), request);
        return ResponseEntity.ok(updated);
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