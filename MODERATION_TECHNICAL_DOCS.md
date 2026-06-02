# Technical Architecture & Implementation Details

## 🏗️ System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ProductModerationForm Component                              │  │
│  │  - Handles user input                                        │  │
│  │  - Calls moderation before submission                        │  │
│  │  - Displays validation feedback                              │  │
│  └────────────┬─────────────────────────────────────────────────┘  │
│               │ Uses                                                 │
│  ┌────────────▼─────────────────────────────────────────────────┐  │
│  │ useModeration() Hook                                         │  │
│  │  - Manages moderation state                                  │  │
│  │  - Provides checkContent() method                            │  │
│  │  - Error & loading state management                          │  │
│  └────────────┬─────────────────────────────────────────────────┘  │
│               │ Calls                                                │
│  ┌────────────▼─────────────────────────────────────────────────┐  │
│  │ moderationService                                            │  │
│  │  - API communication layer                                   │  │
│  │  - Handles POST requests                                     │  │
│  └────────────┬─────────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────────┘
                │ HTTP POST
                │ /api/moderation/check
                │
┌───────────────▼──────────────────────────────────────────────────────┐
│                      Spring Boot Backend                              │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ ProductModerationController                                    │  │
│  │  - REST endpoint definition                                    │  │
│  │  - Request validation (@Valid)                                │  │
│  │  - Security checks (@PreAuthorize)                            │  │
│  │  - HTTP response mapping                                       │  │
│  └────────────┬──────────────────────────────────────────────────┘  │
│               │ Calls                                                │
│  ┌────────────▼──────────────────────────────────────────────────┐  │
│  │ ModerationService                                             │  │
│  │  - Business logic orchestration                               │  │
│  │  - Calls checkTextForToxicity() for each field                │  │
│  │  - Combines results                                           │  │
│  │  - Generates response messages                                │  │
│  └────────────┬──────────────────────────────────────────────────┘  │
│               │ Calls                                                │
│  ┌────────────▼──────────────────────────────────────────────────┐  │
│  │ HuggingFaceClient                                             │  │
│  │  - External API communication                                 │  │
│  │  - Constructs HTTP requests                                   │  │
│  │  - Handles API responses                                      │  │
│  │  - Error handling & logging                                   │  │
│  └────────────┬──────────────────────────────────────────────────┘  │
│               │ Uses                                                 │
│  ┌────────────▼──────────────────────────────────────────────────┐  │
│  │ RestTemplate (Spring HTTP Client)                             │  │
│  │  - Configurable timeouts                                      │  │
│  │  - Connection pooling                                         │  │
│  │  - Exception handling                                         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ HuggingFaceConfig (Configuration Management)                    │  │
│  │  - Loads from application.properties                            │  │
│  │  - API key, model ID, timeouts, thresholds                      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────────────────┘
               │ HTTP Request (Bearer Token)
               │
┌──────────────▼───────────────────────────────────────────────────────┐
│              Hugging Face Inference API (External)                    │
│  Endpoint: https://api-inference.huggingface.co/models/{model_id}    │
│  Model: unitary/toxic-bert                                            │
│  Input: {"inputs": "text to classify"}                                │
│  Output: Classification results with scores                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📨 Request/Response Flow

### 1. Frontend Request

```javascript
// User clicks "Create Product"
const result = await moderationService.checkProduct(title, description);

// HTTP Request sent:
POST /api/moderation/check HTTP/1.1
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "title": "Awesome Summer Dress",
  "description": "Beautiful cotton dress for summer"
}
```

### 2. Backend Processing

```java
// Controller receives request
@PostMapping("/check")
@PreAuthorize("hasRole('SELLER')")
public ResponseEntity<ModerationResponse> checkProductContent(
    @Valid @RequestBody ModerationRequest request) {
    
    // Service processes
    ModerationResponse result = moderationService.moderateProductContent(request);
    
    // Return response
    return ResponseEntity.status(
        "VALID".equals(result.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST
    ).body(result);
}
```

### 3. Service Logic

```java
// Service checks each field
public ModerationResponse moderateProductContent(ModerationRequest request) {
    // Check title
    ModerationResponse titleCheck = checkTextForToxicity(request.getTitle(), "title");
    if ("INVALID".equals(titleCheck.getStatus())) {
        return titleCheck;  // Return immediately if title fails
    }
    
    // Check description
    ModerationResponse descriptionCheck = checkTextForToxicity(
        request.getDescription(), "description"
    );
    if ("INVALID".equals(descriptionCheck.getStatus())) {
        return descriptionCheck;  // Return immediately if description fails
    }
    
    // Both passed
    return new ModerationResponse("VALID", "Product content passed moderation checks");
}
```

### 4. API Client Calls External API

```java
// HuggingFaceClient makes HTTP call
public HuggingFaceResponse checkToxicity(String text) {
    // Prepare headers with authentication
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + apiKey);
    
    // Prepare body
    Map<String, Object> body = new HashMap<>();
    body.put("inputs", text);
    
    // Make API call
    ResponseEntity<HuggingFaceResponse[]> response = restTemplate.postForEntity(
        "https://api-inference.huggingface.co/models/unitary/toxic-bert",
        new HttpEntity<>(body, headers),
        HuggingFaceResponse[].class
    );
    
    return response.getBody()[0];
}
```

### 5. Hugging Face API Response

```json
[
  [
    {"label": "neutral", "score": 0.92},
    {"label": "toxic", "score": 0.05},
    {"label": "severe_toxic", "score": 0.02},
    {"label": "obscene", "score": 0.01},
    {"label": "threat", "score": 0.00},
    {"label": "insult", "score": 0.00}
  ]
]
```

### 6. Backend Response to Frontend

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "VALID",
  "reason": "Product content passed moderation checks",
  "toxicityScore": 0.05,
  "flaggedField": null
}
```

### 7. Frontend Displays Result

```javascript
if (result.status === 'VALID') {
  // Show success message and proceed with product creation
  alert('✅ Content approved! You can now submit your product.');
} else {
  // Show error and block submission
  alert(`❌ ${result.reason}\nPlease review your content.`);
}
```

---

## 🔄 Data Flow Diagram

```
User Input
    │
    ▼
[Product Title]     [Product Description]
    │                       │
    ├───────────┬───────────┤
                │
                ▼
        Form Validation
         (Client-side)
                │
                ▼
        Moderation Check Request
              ▼
        ModerationService
             ▼
    ┌───────┴────────┐
    │                │
    ▼                ▼
Check Title    Check Description
    │                │
    ├────────┬───────┤
             │
             ▼
      HuggingFaceClient
      (Call External API)
             │
             ▼
    Hugging Face API
    (toxic-bert Model)
             │
             ▼
    Classification Results
    (Scores for each label)
             │
             ▼
    Parse "toxic" Score
             │
             ▼
    Compare to Threshold
    (0.7)
             │
    ┌────────┴────────┐
    │                 │
Score > 0.7?        Score ≤ 0.7?
    │                 │
    ▼                 ▼
INVALID             VALID
    │                 │
    └────────┬────────┘
             │
             ▼
    Return Decision
             │
             ▼
    Frontend Gets Response
             │
    ┌────────┴────────┐
    │                 │
  VALID              INVALID
    │                 │
    ▼                 ▼
Allow              Show Error
Submission          & Block
```

---

## 💾 Database Schema (Optional Enhancement)

If you want to log moderation results for analytics:

```sql
CREATE TABLE moderation_log (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT,
    user_id BIGINT,
    title_score DECIMAL(3,2),
    description_score DECIMAL(3,2),
    title_flagged BOOLEAN,
    description_flagged BOOLEAN,
    decision VARCHAR(20),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE INDEX idx_moderation_user ON moderation_log(user_id);
CREATE INDEX idx_moderation_product ON moderation_log(product_id);
```

Implementation (add to ModerationService):
```java
@Autowired
private ModerationLogRepository logRepository;

private void logModerationResult(Long productId, Long userId, 
    Double titleScore, Double descScore, String decision) {
    
    ModerationLog log = new ModerationLog();
    log.setProductId(productId);
    log.setUserId(userId);
    log.setTitleScore(titleScore);
    log.setDescriptionScore(descScore);
    log.setDecision(decision);
    log.setCheckedAt(LocalDateTime.now());
    
    logRepository.save(log);
}
```

---

## 🧵 Thread Safety & Concurrency

### Current Implementation

The system is thread-safe by default:

```java
@Component  // Creates single Spring-managed instance
@Service    // Creates single Spring-managed instance
```

Spring's dependency injection ensures single instances, and `RestTemplate` is thread-safe by default.

### High-Concurrency Optimization

For high traffic, consider:

```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // Configure connection pooling
        return builder
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(30))
            .requestFactory(this::clientHttpRequestFactory)
            .build();
    }
    
    private HttpComponentsClientHttpRequestFactory clientHttpRequestFactory() {
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory();
        
        // Configure connection pool
        HttpClientBuilder httpClientBuilder = HttpClients.custom()
            .setMaxConnTotal(100)  // Total connections
            .setMaxConnPerRoute(20); // Per route
        
        factory.setHttpClient(httpClientBuilder.build());
        return factory;
    }
}
```

---

## 📊 Response Status Codes

| Code | Status | Meaning | Action |
|------|--------|---------|--------|
| 200 | OK | Content passed moderation | Allow product submission |
| 400 | Bad Request | Content failed moderation | Show error, ask user to edit |
| 401 | Unauthorized | Missing JWT token | User must log in |
| 403 | Forbidden | User not seller | Only sellers can create products |
| 500 | Server Error | Backend error | Show generic error message |
| 503 | Service Unavailable | API down | Inform user to try later |

---

## 🔐 Security Implementation

### 1. Authentication

```java
@PostMapping("/check")
@PreAuthorize("hasRole('SELLER')")  // Only authenticated sellers
public ResponseEntity<ModerationResponse> checkProductContent(...) {
    // Only SELLER and ADMIN roles can access
}
```

### 2. Authorization

```java
// In ProductModerationController
String email = SecurityUtil.getCurrentUserEmail();  // From JWT token
UserDTO currentUser = userService.getCurrentUser(email);

// Verify user is seller
if (!currentUser.getRole().equals(Role.SELLER)) {
    throw new UnauthorizedException("Only sellers can create products");
}
```

### 3. Input Validation

```java
@PostMapping("/check")
public ResponseEntity<ModerationResponse> checkProductContent(
    @Valid @RequestBody ModerationRequest request) {
    
    // Automatically validates:
    // - title is not blank
    // - description is not blank
    // - fields are within size limits
    
    // Additional validation in service:
    if (request.getTitle().length() > 500) {
        throw new ValidationException("Title too long");
    }
}
```

### 4. API Key Security

```properties
# ❌ DON'T hardcode in application.properties
huggingface.api-key=hf_actual_key_here

# ✅ DO use environment variables
huggingface.api-key=${HUGGINGFACE_API_KEY}

# ✅ OR use Spring Cloud Config Server (production)
```

### 5. HTTPS/TLS

Ensure all API calls use HTTPS:

```java
// Already configured - uses https://api-inference.huggingface.co
String url = config.getApiUrl() + "/models/" + config.getModelId();
// Results in: https://api-inference.huggingface.co/models/unitary/toxic-bert
```

---

## ⚡ Performance Optimization

### 1. Caching

```java
@Service
public class ModerationService {
    
    @Cacheable(value = "moderationCache", key = "#text.hashCode()")
    public HuggingFaceResponse checkToxicity(String text) {
        // Result cached for identical inputs
    }
}

@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("moderationCache");
    }
}
```

### 2. Async Processing

```java
@Service
public class ModerationService {
    
    @Async
    public CompletableFuture<ModerationResponse> moderateAsync(
        ModerationRequest request) {
        
        ModerationResponse result = moderateProductContent(request);
        return CompletableFuture.completedFuture(result);
    }
}

// In controller
@PostMapping("/check-async")
public CompletableFuture<ResponseEntity<ModerationResponse>> 
checkProductContentAsync(@Valid @RequestBody ModerationRequest request) {
    return moderationService.moderateAsync(request)
        .thenApply(result -> ResponseEntity.ok(result));
}
```

### 3. Request Batching

```java
// Batch multiple texts in single API call
public List<HuggingFaceResponse> checkBatch(List<String> texts) {
    // Hugging Face API accepts array of inputs
    Map<String, Object> body = new HashMap<>();
    body.put("inputs", texts);  // Array instead of single string
    
    ResponseEntity<HuggingFaceResponse[][][]> response = restTemplate.postForEntity(
        url,
        new HttpEntity<>(body, headers),
        HuggingFaceResponse[][][].class
    );
    
    return Arrays.asList(response.getBody()[0]);
}
```

### 4. Connection Pooling

Already configured in `RestTemplateConfig`:

```java
.setConnectTimeout(Duration.ofSeconds(10))  // Connection reuse
.setReadTimeout(Duration.ofSeconds(30))
```

---

## 🧪 Testing Strategy

### Unit Tests

```java
@SpringBootTest
public class ModerationServiceTest {
    
    @MockBean
    private HuggingFaceClient huggingFaceClient;
    
    @Autowired
    private ModerationService moderationService;
    
    @Test
    public void testValidContent() {
        // Mock API response
        HuggingFaceResponse mockResponse = new HuggingFaceResponse();
        mockResponse.setClassifications(Arrays.asList(
            Arrays.asList(
                new HuggingFaceResponse.ClassificationLabel("toxic", 0.05),
                new HuggingFaceResponse.ClassificationLabel("neutral", 0.95)
            )
        ));
        
        when(huggingFaceClient.checkToxicity(anyString()))
            .thenReturn(mockResponse);
        
        // Test
        ModerationRequest request = new ModerationRequest("Safe Title", "Safe Description");
        ModerationResponse response = moderationService.moderateProductContent(request);
        
        // Assert
        assertEquals("VALID", response.getStatus());
    }
}
```

### Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ModerationControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    public void testModerationEndpoint() {
        ModerationRequest request = new ModerationRequest("Title", "Description");
        
        ResponseEntity<ModerationResponse> response = restTemplate.postForEntity(
            "/api/moderation/check",
            request,
            ModerationResponse.class
        );
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("VALID", response.getBody().getStatus());
    }
}
```

---

## 📈 Metrics & Monitoring

```java
@Component
public class ModerationMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Counter validCount;
    private final Counter invalidCount;
    private final Timer apiCallDuration;
    
    public ModerationMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.validCount = Counter.builder("moderation.valid")
            .description("Count of valid products")
            .register(meterRegistry);
        this.invalidCount = Counter.builder("moderation.invalid")
            .description("Count of invalid products")
            .register(meterRegistry);
        this.apiCallDuration = Timer.builder("moderation.api.duration")
            .description("API call duration")
            .register(meterRegistry);
    }
    
    public void recordValidResult() {
        validCount.increment();
    }
    
    public void recordInvalidResult() {
        invalidCount.increment();
    }
    
    public void recordApiCallTime(long duration) {
        apiCallDuration.record(duration, TimeUnit.MILLISECONDS);
    }
}
```

Access metrics at: `http://localhost:8585/actuator/metrics/moderation.valid`

---

## 🚀 Deployment Checklist

- [ ] API key configured in environment variables
- [ ] Spring profiles set up (dev, staging, prod)
- [ ] HTTPS enabled for all external API calls
- [ ] Connection pooling configured
- [ ] Error handling and fallback strategies in place
- [ ] Logging configured for monitoring
- [ ] Rate limiting implemented
- [ ] Cache strategy configured
- [ ] Tests pass (unit + integration)
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Performance tested under load

---

## 📝 Code Examples

### Custom Exception Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ModerationException.class)
    public ResponseEntity<ErrorResponse> handleModerationException(
        ModerationException ex) {
        
        ErrorResponse error = new ErrorResponse(
            "MODERATION_ERROR",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.badRequest().body(error);
    }
}

public class ModerationException extends RuntimeException {
    public ModerationException(String message) {
        super(message);
    }
}
```

### Custom Annotations

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresModerationCheck {
    boolean blockInvalid() default true;
}

@Aspect
@Component
public class ModerationAspect {
    
    @Before("@annotation(requiresModerationCheck)")
    public void checkModeration(JoinPoint joinPoint, 
        RequiresModerationCheck requiresModerationCheck) throws Throwable {
        // Automatic moderation check before method execution
    }
}
```

---

Generated for: Dressrosa PFE Academic Project
Architecture Version: 1.0
