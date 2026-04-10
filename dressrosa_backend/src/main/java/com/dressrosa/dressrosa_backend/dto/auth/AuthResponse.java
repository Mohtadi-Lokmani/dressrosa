package com.dressrosa.dressrosa_backend.dto.auth;

import com.dressrosa.dressrosa_backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String userName;
    private String email;
    private Role role;
    
 
    public AuthResponse(String token, Long userId, String userName, String email, Role role) {
        this.token = token;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.role = role;
    }
}