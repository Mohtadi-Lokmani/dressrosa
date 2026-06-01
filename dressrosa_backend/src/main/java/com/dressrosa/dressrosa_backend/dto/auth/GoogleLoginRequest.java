package com.dressrosa.dressrosa_backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Google ID token is required")
    private String idToken;
    
    private String role; 
    private String shopName;
    private String city;
    private String bio;
    private String telephone;
}
