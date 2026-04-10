package com.dressrosa.dressrosa_backend.dto.product;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ProductVariantRequest {
    private String color;
    private String size;
    
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;
}