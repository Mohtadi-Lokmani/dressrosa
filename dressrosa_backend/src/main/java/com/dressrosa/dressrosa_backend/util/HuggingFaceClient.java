package com.dressrosa.dressrosa_backend.util;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.dressrosa.dressrosa_backend.config.HuggingFaceConfig;
import com.dressrosa.dressrosa_backend.dto.moderation.HuggingFaceResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * Hugging Face API client for making inference requests
 * Uses unitary/toxic-bert model for toxicity classification
 * 
 * Documentation:
 * - Model: https://huggingface.co/unitary/toxic-bert
 * - API: https://huggingface.co/inference-api/documentation
 * - Get API token: https://huggingface.co/settings/tokens
 * 
 * This is a FREE API - no payment required, but usage may be rate-limited
 * 
 * Disabled by default if moderation.use-mock-api=true (uses MockHuggingFaceClient instead)
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "moderation.use-mock-api", havingValue = "false", matchIfMissing = true)
public class HuggingFaceClient extends HuggingFaceClientBase {
    
    @Autowired
    private HuggingFaceConfig config;
    
    @Autowired
    private RestClient restClient;
    
    /**
     * Call Hugging Face API to classify text for toxicity
     * 
     * @param text The text to classify
     * @return HuggingFaceResponse with classification results
     */
    public HuggingFaceResponse checkToxicity(String text) {
        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + config.getApiKey());
            
            // Prepare request body
            Map<String, Object> body = new HashMap<>();
            body.put("inputs", text);
            
            // Build URL
            String url = config.getApiUrl() + "/models/" + config.getModelId();
            
            log.info("Calling Hugging Face API for toxicity check on model: {}", config.getModelId());
            
            // Make API call using RestClient
            HuggingFaceResponse[] responses = restClient.post()
                .uri(url)
                .headers(h -> h.addAll(headers))
                .body(body)
                .retrieve()
                .body(HuggingFaceResponse[].class);
            
            if (responses != null && responses.length > 0) {
                HuggingFaceResponse result = responses[0];
                log.info("Toxicity check completed successfully");
                return result;
            } else {
                log.warn("Unexpected response from Hugging Face API: empty response");
                HuggingFaceResponse errorResponse = new HuggingFaceResponse();
                errorResponse.setError("Unexpected API response");
                return errorResponse;
            }
            
        } catch (Exception e) {
            log.error("Error calling Hugging Face API: ", e);
            HuggingFaceResponse errorResponse = new HuggingFaceResponse();
            errorResponse.setError("API call failed: " + e.getMessage());
            return errorResponse;
        }
    }
}
