package com.dressrosa.dressrosa_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dressrosa.dressrosa_backend.config.HuggingFaceConfig;
import com.dressrosa.dressrosa_backend.dto.moderation.HuggingFaceResponse;
import com.dressrosa.dressrosa_backend.dto.moderation.ModerationRequest;
import com.dressrosa.dressrosa_backend.dto.moderation.ModerationResponse;
import com.dressrosa.dressrosa_backend.util.HuggingFaceClientBase;

import lombok.extern.slf4j.Slf4j;

/**
 * Moderation Service
 * 
 * Orchestrates the moderation process:
 * 1. Receives product title and description
 * 2. Calls Hugging Face API to check for toxicity
 * 3. Interprets the response
 * 4. Returns moderation decision
 * 
 * Business Rules:
 * - If toxicity score > threshold (default 0.7) → REJECT
 * - If toxicity label is "toxic" → REJECT
 * - Otherwise → ACCEPT
 */
@Slf4j
@Service
public class ModerationService {
    
    @Autowired
    private HuggingFaceClientBase huggingFaceClient;
    
    @Autowired
    private HuggingFaceConfig config;
    
    /**
     * Moderate product content (title and description)
     * 
     * @param request ModerationRequest containing title and description
     * @return ModerationResponse with decision and reason
     */
    public ModerationResponse moderateProductContent(ModerationRequest request) {
        log.info("Starting moderation for product - Title length: {}, Description length: {}", 
                request.getTitle().length(), 
                request.getDescription().length());
        
        // Check title
        ModerationResponse titleCheck = checkTextForToxicity(request.getTitle(), "title");
        if ("INVALID".equals(titleCheck.getStatus())) {
            return titleCheck;
        }
        
        // Check description
        ModerationResponse descriptionCheck = checkTextForToxicity(request.getDescription(), "description");
        if ("INVALID".equals(descriptionCheck.getStatus())) {
            return descriptionCheck;
        }
        
        // Both passed
        log.info("Product content passed moderation checks");
        return new ModerationResponse("VALID", "Product content passed moderation checks");
    }
    
    /**
     * Check a single text field for toxicity
     * 
     * @param text The text to check
     * @param fieldName The field name (title or description)
     * @return ModerationResponse with decision
     */
    private ModerationResponse checkTextForToxicity(String text, String fieldName) {
        log.debug("Checking {} for toxicity", fieldName);
        
        // Call Hugging Face API
        HuggingFaceResponse apiResponse = huggingFaceClient.checkToxicity(text);
        
        // Check for API errors
        if (apiResponse.getError() != null) {
            log.error("API error during moderation: {}", apiResponse.getError());
            // In case of API error, we can choose to:
            // Option 1: Reject the content (safer)
            // Option 2: Allow it (more user-friendly but riskier)
            // For this implementation, we'll reject to be safe
            return new ModerationResponse(
                "INVALID",
                "Moderation service temporarily unavailable. Please try again later.",
                null,
                fieldName
            );
        }
        
        // Parse response
        if (apiResponse.getClassifications() == null || apiResponse.getClassifications().isEmpty()) {
            log.warn("No classifications in response");
            return new ModerationResponse(
                "INVALID",
                "Moderation check could not be completed",
                null,
                fieldName
            );
        }
        
        // Get classifications (Hugging Face returns array of classification results)
        var classifications = apiResponse.getClassifications().get(0);
        
        // Find toxic label and its score
        Double toxicityScore = 0.0;
        for (var label : classifications) {
            if ("toxic".equalsIgnoreCase(label.getLabel())) {
                toxicityScore = label.getScore();
                break;
            }
        }
        
        log.debug("Toxicity score for {}: {}", fieldName, toxicityScore);
        log.debug("Toxicity threshold: {}", config.getToxicityThreshold());
        
        // Apply threshold
        if (toxicityScore > config.getToxicityThreshold()) {
            log.warn("Content rejected - toxicity score {} exceeds threshold {} for field: {}",
                    toxicityScore, config.getToxicityThreshold(), fieldName);
            
            return new ModerationResponse(
                "INVALID",
                "Your product " + fieldName + " contains inappropriate content and cannot be published.",
                toxicityScore,
                fieldName
            );
        }
        
        log.debug("Content passed toxicity check for field: {}", fieldName);
        return new ModerationResponse(
            "VALID",
            "Content passed moderation",
            toxicityScore,
            fieldName
        );
    }
}
