package com.dressrosa.dressrosa_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dressrosa.dressrosa_backend.dto.moderation.ModerationRequest;
import com.dressrosa.dressrosa_backend.dto.moderation.ModerationResponse;
import com.dressrosa.dressrosa_backend.service.ModerationService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

/**
 * Product Moderation Controller
 * 
 * Handles AI-based content moderation requests for product listings.
 * Uses Hugging Face Inference API with unitary/toxic-bert model.
 * 
 * Endpoints:
 * POST /api/moderation/check - Check product title and description for toxicity
 * 
 * Access: SELLER role only
 * 
 * Response:
 * {
 *   "status": "VALID" | "INVALID",
 *   "reason": "...",
 *   "toxicityScore": 0.15,
 *   "flaggedField": "title" | "description" | null
 * }
 */
@Slf4j
@RestController
@RequestMapping("/api/moderation")
@CrossOrigin(origins = "*")
public class ProductModerationController {
    
    @Autowired
    private ModerationService moderationService;
    
    /**
     * Check product content for toxicity before submission
     * 
     * This endpoint should be called by the frontend BEFORE submitting the product creation form.
     * If the response status is "VALID", the product can be safely submitted.
     * If "INVALID", show the reason to the user and ask them to modify the content.
     * 
     * @param request ModerationRequest containing title and description
     * @return ModerationResponse with status, reason, and toxicity details
     */
    @PostMapping("/check")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ModerationResponse> checkProductContent(
            @Valid @RequestBody ModerationRequest request) {
        
        log.info("Received moderation check request for product");
        
        // Call moderation service
        ModerationResponse result = moderationService.moderateProductContent(request);
        
        log.info("Moderation check completed - Status: {}", result.getStatus());
        
        // Return with appropriate HTTP status
        // 200 OK for VALID content, 400 Bad Request for INVALID content
        HttpStatus status = "VALID".equals(result.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        
        return ResponseEntity.status(status).body(result);
    }
}
