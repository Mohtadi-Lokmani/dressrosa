package com.dressrosa.dressrosa_backend.dto.admin;

import com.dressrosa.dressrosa_backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long userId;
    private String userName;
    private String email;
    private String telephone;
    private String city;
    private String profilePhoto;
    private Role role;
    private Boolean isVerified;
    private Boolean verificationBadge;
    private LocalDateTime createdAt;

    // Stats
    private long totalProducts;
    private long totalOrders;
    private long followersCount;
}
