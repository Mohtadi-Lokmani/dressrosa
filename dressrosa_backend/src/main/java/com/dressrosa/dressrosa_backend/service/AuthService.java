package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.auth.AuthResponse;
import com.dressrosa.dressrosa_backend.dto.auth.LoginRequest;
import com.dressrosa.dressrosa_backend.dto.auth.RegisterRequest;
import com.dressrosa.dressrosa_backend.model.Role;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.repository.UserRepository;
import com.dressrosa.dressrosa_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.SELLER) {
            if (request.getShopName() == null || request.getShopName().isBlank()) {
                throw new RuntimeException("Atelier name is required for artisans.");
            }
            if (request.getTelephone() == null || request.getTelephone().isBlank()) {
                throw new RuntimeException("Contact line (phone) is required for artisans.");
            }
            if (request.getCity() == null || request.getCity().isBlank()) {
                throw new RuntimeException("City is required for artisans.");
            }
            if (request.getBio() == null || request.getBio().isBlank()) {
                throw new RuntimeException("Artisan signature (bio) is required for artisans.");
            }
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new RuntimeException("This email is already registered.");
        }

        String telephone = request.getTelephone() != null ? request.getTelephone().trim() : "";
        if (!telephone.isEmpty()) {
            if (userRepository.existsByTelephone(telephone)) {
                throw new RuntimeException(
                        "This phone number is already registered. Please use a different number.");
            }
        }

        // Create new user
        User user = new User();
        user.setUserName(request.getUserName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));  // Encrypt password
        user.setTelephone(telephone.isEmpty() ? null : telephone);
        user.setAddress(trimToNull(request.getAddress()));
        user.setCity(trimToNull(request.getCity()));
        user.setShopName(trimToNull(request.getShopName()));
        user.setBio(trimToNull(request.getBio()));
        user.setRole(request.getRole());
        user.setIsVerified(false);  // Email not verified yet
        user.setVerificationBadge(false);  // Not a verified seller
        
        // Save to database
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail());
        
        // Return response
        return new AuthResponse(
            token,
            savedUser.getUserId(),
            savedUser.getUserName(),
            savedUser.getEmail(),
            savedUser.getRole()
        );
    }
   
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        // If authentication succeeds, find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        
        // Return response
        return new AuthResponse(
            token,
            user.getUserId(),
            user.getUserName(),
            user.getEmail(),
            user.getRole()
        );
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}