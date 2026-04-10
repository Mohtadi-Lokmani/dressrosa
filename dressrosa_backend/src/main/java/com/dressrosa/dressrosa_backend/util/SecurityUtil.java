package com.dressrosa.dressrosa_backend.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * SECURITY UTILITY CLASS
 * 
 * What it does:
 * - Provides helper methods to access current logged-in user
 * - Extracts user information from Spring Security context
 * - Used throughout controllers to know "who is making this request"
 * 
 * How it works:
 * 1. JWT filter authenticates user and stores in SecurityContext
 * 2. Controllers call SecurityUtil.getCurrentUserEmail()
 * 3. Returns email of currently logged-in user
 * 
 * Example Usage in Controllers:
 * 
 * String email = SecurityUtil.getCurrentUserEmail();
 * UserDTO currentUser = userService.getCurrentUser(email);
 * // Now you know who the user is!
 */
public class SecurityUtil {
    
    /**
     * GET CURRENT USER'S EMAIL
     * 
     * What it does:
     * - Extract email from JWT token (via Spring Security context)
     * - Returns email of currently authenticated user
     * - Returns null if not authenticated
     * 
     * This is the most commonly used method in controllers
     * 
     * Usage:
     * String email = SecurityUtil.getCurrentUserEmail();
     * if (email == null) {
     *     // User not logged in (shouldn't happen on protected endpoints)
     * }
     * 
     * @return Email of current user, or null if not authenticated
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Check if user is authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // Get principal (user details)
        Object principal = authentication.getPrincipal();
        
        // If principal is UserDetails, extract username (which is email in our case)
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        
        // If principal is String (shouldn't happen, but safe fallback)
        return principal.toString();
    }
    
    /**
     * GET CURRENT AUTHENTICATION OBJECT
     * 
     * What it does:
     * - Returns the full Authentication object
     * - Contains user details, authorities, credentials
     * 
     * Useful for:
     * - Checking user roles
     * - Getting granted authorities
     * - Advanced authentication checks
     * 
     * Usage:
     * Authentication auth = SecurityUtil.getCurrentAuthentication();
     * Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
     * 
     * @return Authentication object, or null if not authenticated
     */
    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
    
    /**
     * CHECK IF USER IS AUTHENTICATED
     * 
     * What it does:
     * - Check if there's a logged-in user
     * - Returns true if user is authenticated
     * - Returns false if anonymous/not logged in
     * 
     * Usage:
     * if (SecurityUtil.isAuthenticated()) {
     *     // User is logged in
     * } else {
     *     // User is not logged in
     * }
     * 
     * Note: On protected endpoints, this should always return true
     * because Spring Security blocks unauthenticated requests
     * 
     * @return true if authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            return false;
        }
        
        // Check if authenticated and not anonymous
        return authentication.isAuthenticated() 
            && !"anonymousUser".equals(authentication.getPrincipal());
    }
    
    /**
     * GET CURRENT USER'S ROLE (OPTIONAL - NOT USED YET)
     * 
     * What it does:
     * - Extract user's role from authorities
     * - Returns role as string (BUYER, SELLER, ADMIN)
     * 
     * Usage:
     * String role = SecurityUtil.getCurrentUserRole();
     * if ("SELLER".equals(role)) {
     *     // User is a seller
     * }
     * 
     * @return User role (without ROLE_ prefix), or null if not found
     */
    public static String getCurrentUserRole() {
        Authentication authentication = getCurrentAuthentication();
        
        if (authentication == null) {
            return null;
        }
        
        // Get first authority (we only use one role per user)
        return authentication.getAuthorities().stream()
            .findFirst()
            .map(authority -> authority.getAuthority().replace("ROLE_", ""))
            .orElse(null);
    }
    
    /**
     * CHECK IF CURRENT USER HAS ROLE (OPTIONAL)
     * 
     * What it does:
     * - Check if current user has specific role
     * 
     * Usage:
     * if (SecurityUtil.hasRole("SELLER")) {
     *     // User is a seller
     * }
     * 
     * @param role Role to check (BUYER, SELLER, ADMIN)
     * @return true if user has role, false otherwise
     */
    public static boolean hasRole(String role) {
        Authentication authentication = getCurrentAuthentication();
        
        if (authentication == null) {
            return false;
        }
        
        String roleWithPrefix = "ROLE_" + role;
        
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals(roleWithPrefix));
    }
    
    /**
     * CLEAR SECURITY CONTEXT (OPTIONAL - FOR LOGOUT)
     * 
     * What it does:
     * - Clear authentication from context
     * - Used during logout
     * 
     * Note: With JWT, logout is usually handled client-side
     * by deleting the token. This method is optional.
     */
    public static void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }
}