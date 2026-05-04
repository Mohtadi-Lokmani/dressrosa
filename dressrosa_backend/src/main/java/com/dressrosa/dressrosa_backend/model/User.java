package com.dressrosa.dressrosa_backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "\"user\"")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;
    
    @Column(unique = true, nullable = false, length = 150)
    private String email;
    
    @Column(name = "shop_name", length = 150)
    private String shopName;
    
    @Column(length = 20, unique = true)
    private String telephone;
    
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(name = "profile_photo", length = 500)
    private String profilePhoto;

    @Column(name = "banner_image", length = 500)
    private String bannerImage;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.BUYER;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "verification_badge")
    private Boolean verificationBadge = false;

    @Column(columnDefinition = "TEXT")
    private String openingHours;

    @Column(name = "auto_reply_message", columnDefinition = "TEXT")
    private String autoReplyMessage;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}