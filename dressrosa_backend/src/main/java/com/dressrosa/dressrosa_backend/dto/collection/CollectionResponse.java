package com.dressrosa.dressrosa_backend.dto.collection;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CollectionResponse {
    private Long collectionId;
    private String name;
    private String coverImage;
    private Integer itemsCount;
    private List<String> previewImages;
    private LocalDateTime createdAt;
}

