package com.dressrosa.dressrosa_backend.dto.moderation;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for moderation endpoint
 * Contains text content to be checked for toxic content
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModerationRequest {
    
    @NotBlank(message = "Title is required for moderation")
    private String title;
    
    @NotBlank(message = "Description is required for moderation")
    private String description;
}
