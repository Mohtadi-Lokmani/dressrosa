package com.dressrosa.dressrosa_backend.dto.user;

import com.dressrosa.dressrosa_backend.model.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long userId;
    private String userName;
    private String email;
    private String telephone;
    private String address;
    private String profilePhoto;
    private String bio;
    private Role role;
    private Boolean isVerified;
    private Boolean verificationBadge;
    private LocalDateTime createdAt;
    
    // Statistics
    private Long followersCount;
    private Long followingCount;
    private Long totalProducts;
}