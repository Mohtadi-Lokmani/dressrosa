package com.dressrosa.dressrosa_backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    
    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    private String userName;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String telephone;
    private String address;
    private String profilePhoto;
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    private String bannerImage;
    private String openingHours;
    private String autoReplyMessage;
}