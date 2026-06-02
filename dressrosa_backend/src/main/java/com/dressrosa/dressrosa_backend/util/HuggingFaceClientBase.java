package com.dressrosa.dressrosa_backend.util;

import com.dressrosa.dressrosa_backend.dto.moderation.HuggingFaceResponse;

/**
 * Abstract base class for Hugging Face client implementations
 * Allows switching between real API and mock implementation
 */
public abstract class HuggingFaceClientBase {
    
    /**
     * Check text for toxicity
     * 
     * @param text The text to check
     * @return HuggingFaceResponse with toxicity classification
     */
    public abstract HuggingFaceResponse checkToxicity(String text);
}
