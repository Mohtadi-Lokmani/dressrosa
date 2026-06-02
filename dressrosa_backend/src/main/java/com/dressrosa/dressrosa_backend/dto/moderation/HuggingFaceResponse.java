package com.dressrosa.dressrosa_backend.dto.moderation;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Hugging Face API response from unitary/toxic-bert model
 * 
 * Response format example:
 * [
 *   [
 *     {"label": "neutral", "score": 0.98},
 *     {"label": "toxic", "score": 0.02}
 *   ]
 * ]
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HuggingFaceResponse {
    
    /**
     * Array of classification results
     * First element contains array of label-score pairs
     */
    private List<List<ClassificationLabel>> classifications;
    
    /**
     * Error response from API (if request fails)
     */
    private String error;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassificationLabel {
        private String label;
        private Double score;
    }
}
