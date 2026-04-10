package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.cart.*;
import com.dressrosa.dressrosa_backend.model.*;
import com.dressrosa.dressrosa_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductMediaRepository productMediaRepository;
    
    /**
     * ADD ITEM TO CART
     * 
     * What it does:
     * 1. Check if product exists and is available
     * 2. Check if variant exists and has stock
     * 3. Check if item already in cart
     *    - If yes: Update quantity
     *    - If no: Add new cart item
     * 4. Validate stock availability
     * 
     * @param request - Product, variant, quantity to add
     * @param userId - Current user
     * @return Updated cart
     * @throws RuntimeException if product unavailable or out of stock
     */
    @Transactional
    public CartResponse addToCart(CartRequest request, Long userId) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check product is available
        if (product.getStatus() == ProductStatus.SOLD_OUT) {
            throw new RuntimeException("Product is sold out");
        }
        
        // Find variant if specified
        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));
            
            // Check variant has enough stock
            if (variant.getQuantity() < request.getQuantity()) {
                throw new RuntimeException("Insufficient stock. Available: " + variant.getQuantity());
            }
        }
        
        // Check if item already in cart
        Cart existingCart = cartRepository.findByUserUserIdAndProductProductIdAndVariantVariantId(
            userId, 
            request.getProductId(), 
            request.getVariantId()
        ).orElse(null);
        
        if (existingCart != null) {
            // Item already in cart - update quantity
            int newQuantity = existingCart.getQuantity() + request.getQuantity();
            
            // Validate stock for new quantity
            if (variant != null && variant.getQuantity() < newQuantity) {
                throw new RuntimeException("Cannot add more. Available: " + variant.getQuantity());
            }
            
            existingCart.setQuantity(newQuantity);
            cartRepository.save(existingCart);
        } else {
            // New cart item
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setVariant(variant);
            cart.setQuantity(request.getQuantity());
            cartRepository.save(cart);
        }
        
        // Return updated cart
        return getCart(userId);
    }
    
    /**
     * GET USER'S CART
     * 
     * What it does:
     * - Fetch all items in user's cart
     * - Calculate item totals (price × quantity)
     * - Calculate cart total
     * - Group items by seller (helpful for checkout)
     * 
     * @param userId - Current user
     * @return CartResponse with all items and totals
     */
    public CartResponse getCart(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserUserId(userId);
        
        CartResponse response = new CartResponse();
        
        // Convert each cart item to response
        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(this::convertToItemResponse)
                .collect(Collectors.toList());
        
        response.setItems(itemResponses);
        
        // Calculate totals
        int totalItems = cartItems.stream()
                .mapToInt(Cart::getQuantity)
                .sum();
        
        BigDecimal totalPrice = itemResponses.stream()
                .map(CartItemResponse::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        response.setTotalItems(totalItems);
        response.setTotalPrice(totalPrice);
        
        return response;
    }
    
    /**
     * UPDATE CART ITEM QUANTITY
     * 
     * What it does:
     * - Change quantity of item in cart
     * - Validate stock availability
     * - If quantity = 0, remove item
     * 
     * @param cartId - Cart item to update
     * @param newQuantity - New quantity
     * @param userId - Current user (for authorization)
     * @return Updated cart
     * @throws RuntimeException if not enough stock
     */
    @Transactional
    public CartResponse updateCartItem(Long cartId, Integer newQuantity, Long userId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        // Check authorization (user can only update their own cart)
        if (!cart.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // If quantity is 0, remove item
        if (newQuantity == 0) {
            cartRepository.delete(cart);
            return getCart(userId);
        }
        
        // Check stock availability
        if (cart.getVariant() != null) {
            if (cart.getVariant().getQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + 
                    cart.getVariant().getQuantity());
            }
        }
        
        cart.setQuantity(newQuantity);
        cartRepository.save(cart);
        
        return getCart(userId);
    }
    
    /**
     * REMOVE ITEM FROM CART
     * 
     * What it does:
     * - Delete specific item from cart
     * - Check user owns this cart item
     * 
     * @param cartId - Cart item to remove
     * @param userId - Current user
     */
    @Transactional
    public void removeFromCart(Long cartId, Long userId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        // Check authorization
        if (!cart.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        cartRepository.delete(cart);
    }
    
    /**
     * CLEAR ENTIRE CART
     * 
     * What it does:
     * - Remove all items from user's cart
     * - Used after successful order placement
     * 
     * @param userId - User whose cart to clear
     */
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUserUserId(userId);
    }
    
    /**
     * CONVERT CART ENTITY TO RESPONSE
     * 
     * What it does:
     * - Transform Cart → CartItemResponse
     * - Include product info, variant info, seller info
     * - Calculate item total (price × quantity)
     */
    private CartItemResponse convertToItemResponse(Cart cart) {
        CartItemResponse response = new CartItemResponse();
        
        response.setCartId(cart.getCartId());
        response.setQuantity(cart.getQuantity());
        
        // Product info
        Product product = cart.getProduct();
        response.setProductId(product.getProductId());
        response.setProductTitle(product.getTitle());
        response.setProductPrice(product.getPrice());
        
        // First product image
        List<ProductMedia> media = productMediaRepository.findByProductProductId(product.getProductId());
        if (!media.isEmpty()) {
            response.setProductImage(media.get(0).getUrl());
        }
        
        // Variant info (if applicable)
        if (cart.getVariant() != null) {
            response.setVariantId(cart.getVariant().getVariantId());
            response.setColor(cart.getVariant().getColor());
            response.setSize(cart.getVariant().getSize());
        }
        
        // Seller info
        response.setSellerId(product.getSeller().getUserId());
        response.setSellerName(product.getSeller().getUserName());
        
        // Calculate item total
        BigDecimal itemTotal = product.getPrice()
                .multiply(BigDecimal.valueOf(cart.getQuantity()));
        response.setItemTotal(itemTotal);
        
        return response;
    }
}