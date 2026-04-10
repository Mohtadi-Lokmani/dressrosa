package com.dressrosa.dressrosa_backend.dto.product;

import lombok.Data;

@Data
public class ProductVariantResponse {
    private Long variantId;
    private String color;
    private String size;
    private Integer quantity;
}