package com.dressrosa.dressrosa_backend.dto.social;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rate;
    
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String comment;
}