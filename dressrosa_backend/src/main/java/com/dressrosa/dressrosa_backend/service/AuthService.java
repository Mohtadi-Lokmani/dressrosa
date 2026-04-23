package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.auth.AuthResponse;
import com.dressrosa.dressrosa_backend.dto.auth.LoginRequest;
import com.dressrosa.dressrosa_backend.dto.auth.RegisterRequest;
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
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        
        // Create new user
        User user = new User();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));  // Encrypt password
        user.setTelephone(request.getTelephone());
        user.setAddress(request.getAddress());
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
}