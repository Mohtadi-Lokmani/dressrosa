package com.dressrosa.dressrosa_backend.dto.auth;

import com.dressrosa.dressrosa_backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Full name is required.")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters.")
    private String userName;
    
    @NotBlank(message = "Email is required.")
    @Email(message = "That does not look like a valid email address.")
    private String email;
    
    @NotBlank(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Password must include uppercase, lowercase, and a number (8+ characters).")
    private String password;
    
    private String telephone;
    private String address;
    private String shopName;
    private String bio;
    private String city;
    private Role role = Role.BUYER;  
}