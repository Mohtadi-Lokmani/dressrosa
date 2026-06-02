# Quick Start Examples & Testing

## 🚀 Immediate Setup (5 minutes)

### 1. Get Hugging Face API Key

```bash
# Step 1: Visit https://huggingface.co and sign up (free)
# Step 2: Go to https://huggingface.co/settings/tokens
# Step 3: Click "New token"
# Step 4: Create token with "read" permission
# Step 5: Copy the token (starts with "hf_")
```

### 2. Update Backend Config

```properties
# File: dressrosa_backend/src/main/resources/application.properties

# Add this section at the end:
huggingface.api-key=hf_YOUR_COPIED_TOKEN_HERE
huggingface.model-id=unitary/toxic-bert
huggingface.api-url=https://api-inference.huggingface.co
huggingface.timeout-seconds=10
huggingface.toxicity-threshold=0.7
```

### 3. Restart Backend

```bash
cd dressrosa_backend
mvn spring-boot:run
```

### 4. Test the Endpoint

```bash
# Login first to get JWT token
curl -X POST http://localhost:8585/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123"
  }'

# Copy the token from response, then test moderation:
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Beautiful Summer Dress",
    "description": "A lovely summer dress in excellent condition"
  }'
```

---

## 📝 Complete API Testing Examples

### Test Case 1: Valid Content

```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Premium Cotton T-Shirt",
    "description": "High quality 100% cotton t-shirt, perfect for everyday wear. Available in multiple colors."
  }'
```

**Expected Response:**
```json
HTTP/1.1 200 OK
{
  "status": "VALID",
  "reason": "Product content passed moderation checks",
  "toxicityScore": 0.03,
  "flaggedField": null
}
```

---

### Test Case 2: Invalid Title

```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Stupid ugly dress for idiots",
    "description": "A nice summer dress"
  }'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request
{
  "status": "INVALID",
  "reason": "Your product title contains inappropriate content and cannot be published.",
  "toxicityScore": 0.89,
  "flaggedField": "title"
}
```

---

### Test Case 3: Invalid Description

```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Summer Dress",
    "description": "Great dress, hate all people who don't buy this"
  }'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request
{
  "status": "INVALID",
  "reason": "Your product description contains inappropriate content and cannot be published.",
  "toxicityScore": 0.75,
  "flaggedField": "description"
}
```

---

### Test Case 4: Edge Case - Mixed Content

```bash
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Awesome Dress",
    "description": "This is the BEST dress you will ever see. Perfect quality, perfect price."
  }'
```

**Expected Response:**
```json
HTTP/1.1 200 OK
{
  "status": "VALID",
  "reason": "Product content passed moderation checks",
  "toxicityScore": 0.01,
  "flaggedField": null
}
```

---

## 🧪 Postman Collection

Create a new collection in Postman:

```json
{
  "info": {
    "name": "Dressrosa Moderation API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Get JWT Token",
      "request": {
        "method": "POST",
        "url": "http://localhost:8585/api/auth/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"seller@example.com\",\n  \"password\": \"password123\"\n}"
        }
      }
    },
    {
      "name": "Check Valid Product",
      "request": {
        "method": "POST",
        "url": "http://localhost:8585/api/moderation/check",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Beautiful Summer Dress\",\n  \"description\": \"High quality summer dress, perfect for hot weather\"\n}"
        }
      }
    },
    {
      "name": "Check Invalid Product",
      "request": {
        "method": "POST",
        "url": "http://localhost:8585/api/moderation/check",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Stupid ugly dress\",\n  \"description\": \"Bad quality junk\"\n}"
        }
      }
    }
  ]
}
```

---

## 🔧 JavaScript/TypeScript Examples

### Using the Moderation Service

```javascript
// Import the service
import moderationService from '@/services/moderationService';

// Example 1: Basic check
async function checkProduct(title, description) {
  try {
    const result = await moderationService.checkProduct(title, description);
    
    if (result.status === 'VALID') {
      console.log('✅ Content approved!');
      console.log('Toxicity Score:', result.toxicityScore);
      return true;
    } else {
      console.log('❌ Content rejected!');
      console.log('Reason:', result.reason);
      console.log('Flagged Field:', result.flaggedField);
      return false;
    }
  } catch (error) {
    console.error('Moderation check failed:', error);
    return false;
  }
}

// Example 2: In React Component
import { useState } from 'react';
import moderationService from '@/services/moderationService';

function ProductForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleCheck = async () => {
    setChecking(true);
    try {
      const moderationResult = await moderationService.checkProduct(
        title,
        description
      );
      setResult(moderationResult);
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <div>
      <input 
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Product Title"
      />
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Product Description"
      />
      
      <button onClick={handleCheck} disabled={checking}>
        {checking ? 'Checking...' : 'Check Content'}
      </button>
      
      {result && (
        <div style={{
          padding: '10px',
          marginTop: '10px',
          backgroundColor: result.status === 'VALID' ? '#d4edda' : '#f8d7da',
          color: result.status === 'VALID' ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          <strong>{result.status === 'VALID' ? '✅' : '❌'} {result.reason}</strong>
          {result.toxicityScore && (
            <p>Toxicity Score: {(result.toxicityScore * 100).toFixed(1)}%</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductForm;
```

---

## 🔍 Debug Logging

### Enable Debug Logs

Add to `application.properties`:

```properties
# Enable debug logging
logging.level.com.dressrosa.dressrosa_backend=DEBUG
logging.level.com.dressrosa.dressrosa_backend.util.HuggingFaceClient=DEBUG
logging.level.com.dressrosa.dressrosa_backend.service.ModerationService=DEBUG

# Log HTTP requests
logging.level.org.springframework.web.servlet.mvc.method.annotation=DEBUG

# Log RestTemplate requests
logging.level.org.springframework.web.client.RestTemplate=DEBUG
```

### Check Logs

```bash
# View logs from terminal
tail -f target/dressrosa_backend.log

# Look for these messages:
# INFO  - Calling Hugging Face API for toxicity check on model: unitary/toxic-bert
# DEBUG - Toxicity check completed successfully
# DEBUG - Toxicity score for title: 0.05
# INFO  - Product content passed moderation checks
```

---

## 📊 Performance Testing

### Load Testing with Apache JMeter

1. Create a test plan with:
   - Setup Thread Group (10 threads)
   - HTTP Sampler to `/api/moderation/check`
   - Ramp-up: 60 seconds
   - Loop count: 10

2. Run:
```bash
jmeter -n -t moderation_load_test.jmx -l results.jtl
```

3. Results should show:
   - Avg response time < 5 seconds
   - Error rate < 5%
   - Throughput depends on API rate limits

---

## 🐛 Common Issues & Solutions

### Issue 1: "API key not found"

```
Error: huggingface.api-key property not found
```

**Solution:**
```properties
# Make sure this line is in application.properties
huggingface.api-key=hf_YOUR_TOKEN_HERE

# Restart the application
# Check that the key doesn't have spaces
```

---

### Issue 2: "Authorization header missing"

```
Error: org.springframework.security.authentication.BadCredentialsException
```

**Solution:**
```bash
# Make sure JWT token is included in header
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  ...

# Token format: "Bearer " + JWT_STRING (note the space)
```

---

### Issue 3: "Request timed out"

```
Error: org.springframework.web.client.HttpClientErrorException: 504 Gateway Timeout
```

**Solution:**
```properties
# Increase timeout in application.properties
huggingface.timeout-seconds=30

# Or check if Hugging Face API is down
# Visit https://status.huggingface.co
```

---

### Issue 4: "Rate limit exceeded"

```
Error: {"error":"Rate limit exceeded"}
```

**Solution:**
```java
// Option 1: Implement caching
@Cacheable(value = "moderationCache", key = "#text.hashCode()")
public ModerationResponse checkText(String text) { ... }

// Option 2: Implement request throttling
@RateLimiter(value = "moderation", capacity = 100, ratePerSecond = 10)
@PostMapping("/check")
public ResponseEntity<ModerationResponse> checkProductContent(...) { ... }

// Option 3: Upgrade to Hugging Face Pro ($9/month)
```

---

## 📚 Learning Resources

### Hugging Face Inference API
- Documentation: https://huggingface.co/inference-api/documentation
- unitary/toxic-bert Model: https://huggingface.co/unitary/toxic-bert
- Try it online: https://huggingface.co/spaces/unitary/Toxic

### Spring Boot
- RestTemplate Guide: https://spring.io/guides/gs/consuming-rest/
- Spring Security: https://spring.io/projects/spring-security
- Spring Data JPA: https://spring.io/projects/spring-data-jpa

### React
- React Hooks: https://react.dev/reference/react/hooks
- Axios: https://axios-http.com/
- State Management: https://react.dev/learn/state-a-components-memory

---

## 📋 Implementation Checklist

- [ ] Get Hugging Face API key
- [ ] Add API key to application.properties
- [ ] Restart backend server
- [ ] Test endpoint with cURL
- [ ] Import moderationService in React component
- [ ] Add moderation check to product form
- [ ] Test with valid content (should pass)
- [ ] Test with toxic content (should fail)
- [ ] Verify error messages display correctly
- [ ] Test in actual product creation flow
- [ ] Update product creation endpoint (optional)
- [ ] Deploy to production

---

## ✅ Final Verification

```bash
# 1. Check backend is running
curl http://localhost:8585/actuator/health
# Expected: {"status":"UP"}

# 2. Get auth token
curl -X POST http://localhost:8585/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"password"}'

# 3. Test moderation endpoint
curl -X POST http://localhost:8585/api/moderation/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test","description":"Test product"}'

# Expected: {"status":"VALID","reason":"..."}

# 4. Check frontend integration works
# Navigate to product creation page in React app
# Try creating product with clean content
# Try creating product with toxic content
# Verify moderation checks work correctly
```

---

Generated for: Dressrosa PFE Project
Quick Reference Version: 1.0
