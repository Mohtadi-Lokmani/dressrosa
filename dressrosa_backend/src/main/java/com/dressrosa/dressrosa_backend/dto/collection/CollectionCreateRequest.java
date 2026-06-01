package com.dressrosa.dressrosa_backend.dto.collection;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CollectionCreateRequest {
    @NotBlank
    private String name;
    private String coverImage;
}

