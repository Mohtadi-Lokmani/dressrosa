package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.admin.*;
import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.model.Category;
import com.dressrosa.dressrosa_backend.model.OrderStatus;
import com.dressrosa.dressrosa_backend.model.Role;
import com.dressrosa.dressrosa_backend.service.AdminService;
import com.dressrosa.dressrosa_backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private CategoryService categoryService;

    // ==================== DASHBOARD ====================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ==================== USERS ====================

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(adminService.getAllUsers(search, role, pageable));
    }

    @PutMapping("/users/{userId}/verify")
    public ResponseEntity<ApiResponse> toggleVerification(@PathVariable Long userId) {
        adminService.toggleVerification(userId);
        return ResponseEntity.ok(ApiResponse.success("Verification toggled"));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse> changeUserRole(
            @PathVariable Long userId,
            @RequestParam Role role) {
        adminService.changeUserRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role updated to " + role));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    // ==================== PRODUCTS ====================

    @GetMapping("/products")
    public ResponseEntity<Page<AdminProductResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(adminService.getAllProducts(search, categoryId, pageable));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long productId) {
        adminService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    @PutMapping("/products/{productId}/boost")
    public ResponseEntity<ApiResponse> toggleProductBoost(@PathVariable Long productId) {
        adminService.toggleProductBoost(productId);
        return ResponseEntity.ok(ApiResponse.success("Boost toggled"));
    }

    // ==================== ORDERS ====================

    @GetMapping("/orders")
    public ResponseEntity<Page<AdminOrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "orderDate,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(adminService.getAllOrders(status, pageable));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        adminService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + status));
    }

    // ==================== CATEGORIES ====================

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody java.util.Map<String, String> body) {
        Category category = categoryService.createCategory(body.get("name"));
        return ResponseEntity.ok(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        Category category = categoryService.updateCategory(id, body.get("name"));
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }

    // ==================== REVIEWS ====================

    @GetMapping("/reviews")
    public ResponseEntity<Page<AdminReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        return ResponseEntity.ok(adminService.getAllReviews(pageable));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long reviewId) {
        adminService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }

    // ==================== NOTIFICATIONS ====================

    @PostMapping("/notifications/send")
    public ResponseEntity<ApiResponse> sendPlatformNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        adminService.sendPlatformNotification(request);
        return ResponseEntity.ok(ApiResponse.success("Notification sent to " + request.getTarget()));
    }
}
