package com.dressrosa.dressrosa_backend.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.dressrosa.dressrosa_backend.dto.moderation.HuggingFaceResponse;
import com.dressrosa.dressrosa_backend.dto.moderation.HuggingFaceResponse.ClassificationLabel;

import lombok.extern.slf4j.Slf4j;

/**
 * Mock Hugging Face API client for local development/testing
 * when external API is unreachable (e.g., behind corporate firewall)
 * 
 * Enabled by setting: moderation.use-mock-api=true
 * 
 * Returns realistic toxicity scores based on keyword detection
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "moderation.use-mock-api", havingValue = "true")
public class MockHuggingFaceClient extends HuggingFaceClientBase {
    
    private static final double TOXICITY_THRESHOLD = 0.5;
    
    // Toxic keywords for simple detection
    private static final String[] TOXIC_KEYWORDS = {
        "hate", "kill", "stupid", "idiot", "trash", "crap", "damn", "curse",
        "badword", "offensive", "vulgar", "crappy", "sucks", "horrible"
    };
    
    // Valid clothing-related keywords
    private static final String[] CLOTHING_KEYWORDS = {
        "dress", "shirt", "pants", "jeans", "jacket", "coat", "blouse", "top", "bottom",
        "skirt", "shorts", "suit", "hoodie", "sweatshirt", "cardigan", "sweater", "polo",
        "tshirt", "t-shirt", "vest", "tank", "leggings", "joggers", "trousers", "blazer",
        "cardigan", "kimono", "robe", "gown", "saree", "lehenga", "tunic", "kaftan",
        "denim", "cotton", "silk", "linen", "wool", "polyester", "summer", "winter",
        "casual", "formal", "elegant", "sporty", "vintage", "modern", "classic", "boho"
    };
    
    /**
     * Mock implementation that simulates Hugging Face toxicity classification
     * Returns realistic scores based on:
     * 1. Toxic keyword detection
     * 2. Gibberish/nonsense validation
     * 3. Clothing-related name validation
     */
    @Override
    public HuggingFaceResponse checkToxicity(String text) {
        try {
            log.info("Using MOCK Hugging Face API for toxicity check");
            
            // Calculate mock toxicity score based on multiple criteria
            double toxicityScore = calculateMockToxicityScore(text.toLowerCase());
            double neutralScore = 1.0 - toxicityScore;
            
            // Create mock response matching Hugging Face format
            HuggingFaceResponse response = new HuggingFaceResponse();
            
            // Create classification labels: [neutral, toxic]
            List<ClassificationLabel> labels = new ArrayList<>();
            labels.add(new ClassificationLabel("neutral", Math.max(0.0, neutralScore)));
            labels.add(new ClassificationLabel("toxic", toxicityScore));
            
            // Wrap in list of lists format expected by API
            List<List<ClassificationLabel>> classifications = new ArrayList<>();
            classifications.add(labels);
            
            response.setClassifications(classifications);
            
            log.info("Mock result: toxic score = {}, neutral score = {}", toxicityScore, neutralScore);
            return response;
            
        } catch (Exception e) {
            log.error("Error in mock toxicity check: ", e);
            HuggingFaceResponse errorResponse = new HuggingFaceResponse();
            errorResponse.setError("Mock API error: " + e.getMessage());
            return errorResponse;
        }
    }
    
    /**
     * Calculate mock toxicity score based on multiple criteria:
     * - Toxic keywords
     * - Gibberish detection
     * - Valid product name validation
     * - Inappropriate characters
     */
    private double calculateMockToxicityScore(String text) {
        double score = 0.0;
        
        // VALIDATION 1: Check minimum length
        if (text.length() < 3) {
            score += 0.8;
            log.warn("Text too short: {}", text);
        }
        
        // VALIDATION 2: Check for gibberish (repeated characters)
        // e.g., "aaaaaa", "zegag", etc.
        if (isGibberish(text)) {
            score = 0.85; // Set to high score directly - this is gibberish
            log.warn("Gibberish detected: {}", text);
            return score;
        }
        
        // VALIDATION 3: Check for toxic keywords
        int toxicMatches = 0;
        for (String keyword : TOXIC_KEYWORDS) {
            if (text.contains(keyword)) {
                toxicMatches++;
            }
        }
        
        if (toxicMatches > 0) {
            score += Math.min(0.95, 0.3 + (toxicMatches * 0.2));
            log.warn("Toxic keywords found: {}", toxicMatches);
        }
        
        // VALIDATION 4: For titles (product names), check if it contains clothing keywords
        // This helps prevent gibberish like "zegag" from being accepted
        if (!containsClothingKeyword(text) && text.length() > 3) {
            // Penalize if it doesn't have clothing keywords and is long enough
            score += 0.45;
            log.debug("No clothing keywords found in title: {}", text);
        }
        
        // VALIDATION 5: Check for excessive special characters or numbers only
        if (isNumbersOnly(text)) {
            score += 0.8;
            log.warn("Numbers only detected: {}", text);
        }
        
        if (hasExcessiveSpecialChars(text)) {
            score += 0.5;
            log.warn("Excessive special characters: {}", text);
        }
        
        // VALIDATION 6: Check for excessive punctuation
        if (text.contains("!!!") || text.contains("???") || text.contains("...")) {
            score += 0.15;
        }
        
        // Cap score at 1.0
        return Math.min(1.0, score);
    }
    
    /**
     * Detect gibberish patterns like repeated characters or nonsense
     */
    private boolean isGibberish(String text) {
        // Check for repeated characters (e.g., "aaaa", "zzzz")
        for (int i = 0; i < text.length() - 2; i++) {
            char c = text.charAt(i);
            if (c == text.charAt(i + 1) && c == text.charAt(i + 2)) {
                return true; // Found 3+ repeated characters
            }
        }
        
        // Check if it looks like random gibberish (no vowels or all consonants)
        long vowels = text.chars().filter(c -> "aeiou".indexOf(c) >= 0).count();
        if (text.length() > 4 && vowels == 0) {
            return true; // No vowels = likely gibberish
        }
        
        // Check for random alternating pattern (like "zegag", "xoxox")
        if (isRandomPattern(text)) {
            return true;
        }
        
        // Check if it's just random characters with no meaning
        if (text.matches(".*[^a-z\\s-].*") && !text.contains(" ")) {
            // Has special chars and no spaces = likely gibberish
            return text.length() < 5; // Only mark short ones as gibberish
        }
        
        return false;
    }
    
    /**
     * Detect random alternating patterns like "zegag", "xoxox", "abab"
     */
    private boolean isRandomPattern(String text) {
        if (text.length() < 4) return false;
        
        // Count vowels and consonants
        long vowels = text.chars().filter(c -> "aeiou".indexOf(c) >= 0).count();
        long consonants = text.replaceAll("[aeiou\\s-]", "").length();
        
        // Check for excessive alternation between vowels and consonants
        int alternations = 0;
        boolean lastWasVowel = "aeiou".indexOf(text.charAt(0)) >= 0;
        
        for (int i = 1; i < text.length(); i++) {
            char c = text.charAt(i);
            boolean isVowel = "aeiou".indexOf(c) >= 0;
            
            if (isVowel != lastWasVowel && c != ' ' && c != '-') {
                alternations++;
            }
            if (c != ' ' && c != '-') {
                lastWasVowel = isVowel;
            }
        }
        
        // If mostly alternating between vowels and consonants = gibberish
        if (alternations > text.length() * 0.6) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if text contains clothing-related keywords
     */
    private boolean containsClothingKeyword(String text) {
        for (String keyword : CLOTHING_KEYWORDS) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if text is only numbers
     */
    private boolean isNumbersOnly(String text) {
        return text.replaceAll("[0-9\\s]", "").length() == 0 && text.length() > 0;
    }
    
    /**
     * Check for excessive special characters
     */
    private boolean hasExcessiveSpecialChars(String text) {
        long specialChars = text.chars()
            .filter(c -> !Character.isLetterOrDigit(c) && c != ' ' && c != '-')
            .count();
        return specialChars > text.length() * 0.3; // More than 30% special chars
    }
}
