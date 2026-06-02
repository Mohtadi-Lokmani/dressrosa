package com.dressrosa.dressrosa_backend.dto.moderation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for moderation API
 * Contains the moderation result and any additional details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModerationResponse {
    
    /**
     * Status of moderation: "VALID" or "INVALID"
     * VALID: Content passed moderation and can be saved
     * INVALID: Content failed moderation and should be rejected
     */
    private String status;
    
    /**
     * Reason for the decision
     */
    private String reason;
    
    /**
     * Detailed information about what was flagged (optional)
     */
    private String details;
    
    /**
     * Toxicity score (0.0 to 1.0)
     */
    private Double toxicityScore;
    
    /**
     * Which field was problematic (title or description)
     */
    private String flaggedField;
    
    // Constructor for simple response
    public ModerationResponse(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }
    
    // Constructor for full response
    public ModerationResponse(String status, String reason, Double toxicityScore, String flaggedField) {
        this.status = status;
        this.reason = reason;
        this.toxicityScore = toxicityScore;
        this.flaggedField = flaggedField;
    }
}
