# AI-Based Auto Moderation System - Complete Setup Guide

## 📋 Overview

This guide explains how to set up and use the AI-based auto moderation system for product listings in the Dressrosa application. The system uses Hugging Face Inference API with the `unitary/toxic-bert` model to automatically detect and block inappropriate product content.

---

## 🎯 Key Features

✅ **Free & Easy Setup** - Uses completely free Hugging Face Inference API
✅ **Real-time Validation** - Checks content before product submission
✅ **Toxic Content Detection** - Identifies inappropriate language using AI
✅ **User-Friendly Feedback** - Clear messages guide sellers to appropriate content
✅ **Production-Ready** - Clean architecture, error handling, and logging
✅ **Academic-Suitable** - Well-commented, documented, and follows best practices

---

## 🚀 Quick Start

### Step 1: Get Hugging Face API Key

1. Go to https://huggingface.co
2. Sign up (completely free)
3. Navigate to Settings → Access Tokens
4. Click "New token"
5. Name it something like "dressrosa-moderation"
6. Select "read" permission (we only read predictions)
7. Copy the token

### Step 2: Configure Backend

Update `dressrosa_backend/src/main/resources/application.properties`:

```properties
# Replace YOUR_HUGGINGFACE_API_KEY_HERE with your actual token
huggingface.api-key=YOUR_HUGGINGFACE_API_KEY_HERE
```

**For Production**: Use environment variables instead:
```bash
export HUGGINGFACE_API_KEY=your_actual_token_here
```

Then update application.properties:
```properties
huggingface.api-key=${HUGGINGFACE_API_KEY:your_default_key}
```

### Step 3: Test the Backend

Build and run the backend:
```bash
cd dressrosa_backend
mvn clean package
mvn spring-boot:run
```

Test the moderation endpoint:
```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Awesome dress",
    "description": "Beautiful summer dress in great condition"
  }'
```

Expected Response (if content is clean):
```json
{
  "status": "VALID",
  "reason": "Product content passed moderation checks",
  "toxicityScore": 0.05,
  "flaggedField": null
}
```

### Step 4: Integrate with React

The React integration is already implemented in these files:
- `src/services/moderationService.js` - API communication
- `src/hooks/useModeration.js` - React hook for easy usage
- `src/components/product/ProductModerationForm.jsx` - Example form component

Use in any product creation form:
```jsx
import useModeration from '../../hooks/useModeration';

const MyProductForm = () => {
  const { checkContent, isChecking, error, result } = useModeration();
  
  const handleSubmit = async (title, description) => {
    const result = await checkContent(title, description);
    if (result?.status === 'VALID') {
      // Submit product
    } else {
      // Show error message
    }
  };
};
```

---

## 📁 File Structure

### Backend Files Created

```
dressrosa_backend/src/main/java/com/dressrosa/dressrosa_backend/
├── config/
│   ├── HuggingFaceConfig.java          # Configuration properties
│   └── RestTemplateConfig.java         # HTTP client config
├── controller/
│   └── ProductModerationController.java # REST endpoints
├── service/
│   └── ModerationService.java          # Business logic
├── util/
│   └── HuggingFaceClient.java          # API client
└── dto/moderation/
    ├── ModerationRequest.java          # Request DTO
    ├── ModerationResponse.java         # Response DTO
    └── HuggingFaceResponse.java        # API response DTO
```

### Frontend Files Created

```
dressrosa-frontend/src/
├── services/
│   └── moderationService.js            # API service
├── hooks/
│   └── useModeration.js                # React hook
└── components/product/
    └── ProductModerationForm.jsx       # Example form
```

---

## 🔌 API Endpoints

### Check Product Moderation

**POST** `/api/moderation/check`

**Authentication**: Required (SELLER role or higher)

**Request Body**:
```json
{
  "title": "Product title",
  "description": "Product description"
}
```

**Response (Valid Content)**:
```json
{
  "status": "VALID",
  "reason": "Product content passed moderation checks",
  "toxicityScore": 0.12,
  "flaggedField": null
}
```

**Response (Invalid Content)**:
```json
{
  "status": "INVALID",
  "reason": "Your product title contains inappropriate content and cannot be published.",
  "toxicityScore": 0.89,
  "flaggedField": "title"
}
```

**Status Codes**:
- `200 OK` - Content passed moderation
- `400 Bad Request` - Content failed moderation or invalid request
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not a seller

---

## 🧠 How It Works

### Architecture Diagram

```
Frontend (React)
    ↓
Product Form Component
    ↓
moderationService.checkProduct()
    ↓
POST /api/moderation/check
    ↓
ProductModerationController
    ↓
ModerationService
    ├─ Calls checkTextForToxicity()
    ├─ Checks title
    ├─ Checks description
    └─ Combines results
    ↓
HuggingFaceClient
    ↓
HTTP POST to Hugging Face API
    ├─ Endpoint: https://api-inference.huggingface.co/models/unitary/toxic-bert
    ├─ Authentication: Bearer Token
    └─ Body: {"inputs": "text to check"}
    ↓
Hugging Face Returns Classification
    ├─ Labels: ["toxic", "neutral", "obscene", "insult", "threat", "severe_toxic"]
    ├─ Scores: [0.05, 0.92, 0.02, 0.01, 0.00, 0.00]
    └─ (Different models have different labels)
    ↓
ModerationService Interprets Response
    ├─ Extract "toxic" score
    ├─ Compare to threshold (0.7)
    ├─ Generate user-friendly message
    └─ Return ModerationResponse
    ↓
Backend Returns Response to Frontend
    ↓
Frontend Displays Result
    ├─ If VALID: Show success, allow submission
    ├─ If INVALID: Show warning, block submission
    └─ Allow user to edit and try again
```

### Business Logic

```java
if (toxicityScore > threshold) {
    return "INVALID" // Reject
} else {
    return "VALID" // Accept
}
```

The system checks both title and description. If either fails, the entire product is rejected.

---

## 🧪 Testing

### Unit Test Example

```java
@SpringBootTest
public class ModerationServiceTest {
    
    @Autowired
    private ModerationService moderationService;
    
    @Test
    public void testCleanContent() {
        ModerationRequest request = new ModerationRequest(
            "Beautiful Summer Dress",
            "A lovely summer dress in excellent condition"
        );
        
        ModerationResponse response = moderationService.moderateProductContent(request);
        
        assertEquals("VALID", response.getStatus());
    }
    
    @Test
    public void testToxicContent() {
        ModerationRequest request = new ModerationRequest(
            "Dress for [toxic word]",
            "Buy this product [insulting content]"
        );
        
        ModerationResponse response = moderationService.moderateProductContent(request);
        
        assertEquals("INVALID", response.getStatus());
    }
}
```

### Manual Testing

#### Test Case 1: Valid Content
```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Premium Cotton T-shirt",
    "description": "High quality cotton t-shirt perfect for everyday wear"
  }'
```

Expected: `status: "VALID"`

#### Test Case 2: Invalid Title
```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Dress [profanity]",
    "description": "A nice dress"
  }'
```

Expected: `status: "INVALID"`, `flaggedField: "title"`

#### Test Case 3: Invalid Description
```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Dress",
    "description": "Great dress, [insulting content]"
  }'
```

Expected: `status: "INVALID"`, `flaggedField: "description"`

---

## ⚙️ Configuration Options

### application.properties

```properties
# API Key (required)
huggingface.api-key=YOUR_TOKEN_HERE

# Model to use for classification
# Options: unitary/toxic-bert, michellejieli/NSFW_text_classifier
huggingface.model-id=unitary/toxic-bert

# Hugging Face API URL
huggingface.api-url=https://api-inference.huggingface.co

# Request timeout in seconds
huggingface.timeout-seconds=10

# Toxicity threshold (0.0 to 1.0)
# Increase to be more lenient, decrease to be more strict
huggingface.toxicity-threshold=0.7
```

### Fine-tuning the Threshold

- **0.5**: Strict (catches more inappropriate content, but may block legitimate content)
- **0.7**: Balanced (recommended for most cases)
- **0.9**: Lenient (allows more content, but may miss some inappropriate content)

---

## 🔍 Monitoring & Logging

The system includes comprehensive logging. Check logs for:

```
INFO  - Moderation check started
DEBUG - Calling Hugging Face API
INFO  - Toxicity check completed successfully
DEBUG - Toxicity score: 0.12
INFO  - Product content passed moderation checks
```

For debugging, enable debug logging:

```properties
logging.level.com.dressrosa.dressrosa_backend=DEBUG
```

---

## 🚨 Error Handling

### API Failures

If Hugging Face API is unavailable:
- Response: `status: "INVALID"` with error message
- Safety: System defaults to rejection to prevent spam
- Alternative: Modify `HuggingFaceClient.checkToxicity()` to allow content on API failures

### Timeouts

If API call takes longer than `timeout-seconds`:
- Response: `status: "INVALID"` with timeout message
- Current timeout: 10 seconds (configurable)
- Adjust in `RestTemplateConfig.java` if needed

### Rate Limiting

Hugging Face free tier has rate limits:
- Implement request queuing or caching if needed
- Add `@Cacheable` annotation to cache results for identical inputs
- Consider paid tier for production high-traffic scenarios

---

## 📊 Available Models

### Recommended: unitary/toxic-bert
- **Labels**: toxic, severe_toxic, obscene, threat, insult, identity_hate
- **Accuracy**: 95%+
- **Best for**: General content moderation
- **Free tier**: Yes, with rate limits

### Alternative: michellejieli/NSFW_text_classifier
- **Labels**: SFW, NSFW
- **Accuracy**: 90%+
- **Best for**: NSFW content detection
- **Free tier**: Yes

### Usage
To switch models, update `application.properties`:
```properties
huggingface.model-id=michellejieli/NSFW_text_classifier
```

---

## 🔐 Security Considerations

### API Key Security

✅ **DO**:
- Use environment variables in production
- Store in secure vaults (AWS Secrets Manager, Azure Key Vault)
- Rotate keys periodically
- Use "read-only" token permission

❌ **DON'T**:
- Commit API key to git
- Log API key values
- Use same key across environments

### Rate Limiting

The system is rate-limited by Hugging Face. To prevent abuse:

1. Add API call rate limiting on backend:
```java
@RateLimiter(value = "moderation", capacity = 100, timeWindowInSeconds = 60)
@PostMapping("/check")
public ResponseEntity<ModerationResponse> checkProductContent(...) {
    // ...
}
```

2. Add frontend debouncing (already implemented in hook)

---

## 🎓 Academic Project Notes

### Architecture Principles

1. **Separation of Concerns**
   - Controller: HTTP handling
   - Service: Business logic
   - Client: External API interaction
   - Config: Configuration management

2. **Error Handling**
   - Graceful degradation on API failures
   - User-friendly error messages
   - Comprehensive logging for debugging

3. **Code Quality**
   - Clear comments and documentation
   - Consistent naming conventions
   - Follows Spring Boot best practices

### Scalability Considerations

For larger deployments:

1. **Caching**
   ```java
   @Cacheable(value = "moderation", key = "#text.hashCode()")
   public ModerationResponse checkText(String text) { ... }
   ```

2. **Async Processing**
   ```java
   @Async
   public CompletableFuture<ModerationResponse> asyncModerate(ModerationRequest req) { ... }
   ```

3. **Batch Requests**
   - Modify API client to batch multiple texts in single request

---

## 📚 References

- Hugging Face Documentation: https://huggingface.co/inference-api/documentation
- unitary/toxic-bert Model: https://huggingface.co/unitary/toxic-bert
- Spring Boot RestTemplate: https://spring.io/guides/gs/consuming-rest/
- Jackson JSON Processing: https://github.com/FasterXML/jackson

---

## ❓ FAQ

**Q: Is the Hugging Face API really free?**
A: Yes! Free tier allows multiple requests per day. Check current limits at https://huggingface.co

**Q: What if the API goes down?**
A: Currently, content is rejected. For production, modify `HuggingFaceClient` to allow content on failures.

**Q: Can I use a different AI model?**
A: Yes! Hugging Face has thousands of models. Update `huggingface.model-id` in config.

**Q: How accurate is the moderation?**
A: unitary/toxic-bert has 95%+ accuracy. False positives may occur with legitimate but unusual content.

**Q: What about non-English content?**
A: Most models work with English primarily. For multilingual support, consider fine-tuning or alternative models.

**Q: Can sellers appeal rejected products?**
A: Current system blocks all rejected content. You can add an appeal system by:
1. Storing rejection reasons in database
2. Creating seller appeal endpoint
3. Admin review dashboard

---

## 📞 Support

For issues:
1. Check logs for error messages
2. Verify API key is correct
3. Test with cURL commands
4. Check Hugging Face service status
5. Review documentation in code comments

---

Generated for: Dressrosa PFE Academic Project
Version: 1.0
Last Updated: 2024
