package com.dressrosa.dressrosa_backend.dto.product;

import com.dressrosa.dressrosa_backend.model.MediaType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductMediaDTO {
    private String url;
    private MediaType type;
}
