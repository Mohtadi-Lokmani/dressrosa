package com.dressrosa.dressrosa_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration class for Hugging Face API settings.
 * Loads from application.properties
 * 
 * Properties:
 * - huggingface.api-key: API key from https://huggingface.co/settings/tokens
 * - huggingface.model-id: Model to use (default: unitary/toxic-bert)
 * - huggingface.api-url: Base API URL (default: https://api-inference.huggingface.co)
 * - huggingface.timeout-seconds: API call timeout in seconds
 * - huggingface.toxicity-threshold: Score threshold for rejection (default: 0.7)
 */
@Component
@ConfigurationProperties(prefix = "huggingface")
public class HuggingFaceConfig {
    
    private String apiKey;
    private String modelId = "unitary/toxic-bert";
    private String apiUrl = "https://api-inference.huggingface.co";
    private long timeoutSeconds = 10;
    private double toxicityThreshold = 0.7;
    
    // Getters and Setters
    public String getApiKey() {
        return apiKey;
    }
    
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String getModelId() {
        return modelId;
    }
    
    public void setModelId(String modelId) {
        this.modelId = modelId;
    }
    
    public String getApiUrl() {
        return apiUrl;
    }
    
    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }
    
    public long getTimeoutSeconds() {
        return timeoutSeconds;
    }
    
    public void setTimeoutSeconds(long timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }
    
    public double getToxicityThreshold() {
        return toxicityThreshold;
    }
    
    public void setToxicityThreshold(double toxicityThreshold) {
        this.toxicityThreshold = toxicityThreshold;
    }
}
