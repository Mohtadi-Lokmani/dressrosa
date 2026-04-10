package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.cart.CartRequest;
import com.dressrosa.dressrosa_backend.dto.cart.CartResponse;
import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.CartService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
   
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        CartResponse cart = cartService.getCart(currentUser.getUserId());
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody CartRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        CartResponse cart = cartService.addToCart(request, currentUser.getUserId());
        return ResponseEntity.ok(cart);
    }
    
   
    @PutMapping("/{cartId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long cartId,
            @RequestParam Integer quantity) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        CartResponse cart = cartService.updateCartItem(cartId, quantity, currentUser.getUserId());
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping("/{cartId}")
    public ResponseEntity<ApiResponse> removeFromCart(@PathVariable Long cartId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        cartService.removeFromCart(cartId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart"));
    }
    
    
    @DeleteMapping
    public ResponseEntity<ApiResponse> clearCart() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        cartService.clearCart(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}