package com.dressrosa.dressrosa_backend.controller;
import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.dto.product.ProductListResponse;
import com.dressrosa.dressrosa_backend.dto.product.ProductRequest;
import com.dressrosa.dressrosa_backend.dto.product.ProductResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.ProductService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;


@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private UserService userService;
    
    
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ProductResponse product = productService.createProduct(request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }
    
    @GetMapping
    public ResponseEntity<Page<ProductListResponse>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
    
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        
        Page<ProductListResponse> products = productService.getAllProducts(
            categoryId, minPrice, maxPrice, search, pageable
        );
        
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/following")
    public ResponseEntity<Page<ProductListResponse>> getFollowingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductListResponse> products = productService.getFollowingProducts(
            currentUser.getUserId(), pageable
        );
        
        return ResponseEntity.ok(products);
    }
    
   
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<Page<ProductListResponse>> getSellerProducts(
            @PathVariable Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductListResponse> products = productService.getSellerProducts(sellerId, pageable);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/my-products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Page<ProductListResponse>> getMyProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductListResponse> products = productService.getSellerProducts(
            currentUser.getUserId(), pageable
        );
        
        return ResponseEntity.ok(products);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ProductResponse updated = productService.updateProduct(id, request, currentUser.getUserId());
        return ResponseEntity.ok(updated);
    }
    

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        productService.deleteProduct(id, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }
}