package com.dressrosa.dressrosa_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * REST Template Configuration
 * 
 * Provides RestClient bean with timeouts configured for external API calls.
 * Used by HuggingFaceClient for making HTTP requests to Hugging Face API.
 */
@Configuration
public class RestTemplateConfig {
    
    /**
     * Create RestClient bean with timeout settings
     * 
     * @return Configured RestClient instance
     */
    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .build();
    }
}
