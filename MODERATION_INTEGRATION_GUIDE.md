# Integration Guide: Adding Moderation to Existing Product Creation

## 🎯 Overview

This guide shows how to integrate the moderation system into your existing product creation flow. There are two approaches:

1. **Frontend-only** (Recommended for now): Check moderation before sending to backend
2. **Backend enforcement**: Check moderation when product is created

---

## 📌 Approach 1: Frontend-Only Moderation (Recommended)

This approach checks content on the frontend before even sending to the backend. Simpler to implement and provides immediate user feedback.

### Step 1: Update Your Product Creation Page

```jsx
// File: src/pages/seller/CreateProductPage.jsx or similar

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useModeration from '../../hooks/useModeration';
import moderationService from '../../services/moderationService';
import productService from '../../services/productService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { checkContent, isChecking, result: moderationResult } = useModeration();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: null,
    imageUrls: [],
    videoUrls: [],
    variants: []
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationWarning, setModerationWarning] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Main submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1: Validate form
    if (!validateForm()) {
      return;
    }
    
    // Step 2: Check moderation
    await checkModeration();
  };

  // Check content moderation
  const checkModeration = async () => {
    const moderationResult = await checkContent(
      formData.title,
      formData.description
    );
    
    if (moderationResult?.status === 'INVALID') {
      // Show warning modal
      setModerationWarning(moderationResult);
      setShowWarningModal(true);
      return;
    }
    
    // Content passed moderation - proceed to submit
    await submitProduct();
  };

  // Submit product to backend
  const submitProduct = async () => {
    setIsSubmitting(true);
    
    try {
      // Call your existing product creation service
      const response = await productService.createProduct(formData);
      
      // Success
      console.log('Product created:', response);
      
      // Show success message
      alert('✅ Product created successfully!');
      
      // Redirect to product detail or products list
      navigate(`/products/${response.productId}`);
      
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ submit: error.message || 'Failed to create product' });
      alert('❌ Error creating product: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setShowWarningModal(false);
    }
  };

  // Handle "Force Submit" button in warning modal
  const handleForceSubmit = async () => {
    await submitProduct();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Product</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Product Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Beautiful Summer Dress"
            maxLength={200}
            className="w-full"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Product Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your product in detail..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Product Price */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Category Selection (existing) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          {/* Add your existing category selector here */}
        </div>

        {/* General Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            <strong>Error:</strong> {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || isChecking}
            className="flex-1"
            variant="primary"
          >
            {isSubmitting || isChecking ? '⏳ Processing...' : '📝 Create Product'}
          </Button>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Moderation Warning Modal */}
      {showWarningModal && moderationWarning && (
        <Modal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          title="⚠️ Content Moderation Issue"
        >
          <div className="mb-6">
            <p className="text-red-600 font-medium mb-3">
              {moderationWarning.reason}
            </p>
            
            {moderationWarning.flaggedField && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Flagged Field:</strong> {moderationWarning.flaggedField}
                </p>
              </div>
            )}
            
            {moderationWarning.toxicityScore !== undefined && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-3">
                <p className="text-sm text-blue-800">
                  <strong>Toxicity Score:</strong> {(moderationWarning.toxicityScore * 100).toFixed(1)}%
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-700">
              Please review and modify your product title and description to remove inappropriate content.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowWarningModal(false)}
              variant="primary"
              className="flex-1"
            >
              👈 Back to Edit
            </Button>
            <Button
              onClick={handleForceSubmit}
              variant="secondary"
              className="flex-1"
            >
              ⏭️ Skip Check
            </Button>
          </div>
        </Modal>
      )}

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
        <strong>ℹ️ AI Content Moderation</strong>
        <p className="mt-2 text-sm">
          Your product title and description will be automatically checked to ensure they follow our community guidelines.
          Inappropriate content may be rejected. This helps keep our marketplace safe and professional.
        </p>
      </div>
    </div>
  );
};

export default CreateProductPage;
```

---

## 📌 Approach 2: Backend Enforcement (Optional)

If you want to add moderation checks to your existing ProductController:

### Step 1: Update ProductService

```java
// File: dressrosa_backend/src/main/java/com/dressrosa/dressrosa_backend/service/ProductService.java

package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.moderation.ModerationRequest;
import com.dressrosa.dressrosa_backend.dto.moderation.ModerationResponse;
import com.dressrosa.dressrosa_backend.dto.product.ProductRequest;
import com.dressrosa.dressrosa_backend.dto.product.ProductResponse;
import com.dressrosa.dressrosa_backend.model.Product;
import com.dressrosa.dressrosa_backend.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ModerationService moderationService;  // Add this
    
    /**
     * Create a new product with moderation check
     */
    public ProductResponse createProduct(ProductRequest request, Long userId) {
        
        // Step 1: Validate input
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Product title is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new IllegalArgumentException("Product description is required");
        }
        
        log.info("Creating product for user: {}", userId);
        
        // Step 2: Check moderation (NEW)
        ModerationRequest moderationRequest = new ModerationRequest(
            request.getTitle(),
            request.getDescription()
        );
        
        ModerationResponse moderationResult = moderationService.moderateProductContent(
            moderationRequest
        );
        
        // Block product creation if moderation fails
        if ("INVALID".equals(moderationResult.getStatus())) {
            log.warn("Product rejected due to moderation: {}", moderationResult.getReason());
            throw new IllegalArgumentException(
                "Product rejected: " + moderationResult.getReason()
            );
        }
        
        log.info("Product passed moderation check");
        
        // Step 3: Create product (existing logic)
        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        // ... rest of product creation logic
        
        Product savedProduct = productRepository.save(product);
        
        return convertToResponse(savedProduct);
    }
    
    // ... rest of existing methods
}
```

### Step 2: Update ProductController

```java
// File: dressrosa_backend/src/main/java/com/dressrosa/dressrosa_backend/controller/ProductController.java

// In existing createProduct method, wrap with error handling:

@PostMapping
@PreAuthorize("hasRole('SELLER')")
public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest request) {
    try {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        ProductResponse product = productService.createProduct(request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
        
    } catch (IllegalArgumentException e) {
        // Return moderation error to frontend
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
```

---

## 🔄 Integration Flow Comparison

### Approach 1: Frontend Moderation (Recommended)
```
User Input
    ↓
Frontend Validation
    ↓
Moderation Check (Frontend calls /api/moderation/check)
    ↓
If INVALID: Show warning, don't submit
If VALID: Submit to /api/products
    ↓
Product Created
```

**Pros:**
- Better UX - immediate feedback
- Faster response time
- Less server load
- Can retry immediately

**Cons:**
- Requires frontend implementation
- Could be bypassed by API calls

### Approach 2: Backend Enforcement
```
User Input
    ↓
Frontend Validation
    ↓
Submit to /api/products
    ↓
Backend Moderation Check
    ↓
If INVALID: Return error
If VALID: Create and return product
    ↓
Frontend shows result
```

**Pros:**
- Enforced on backend - can't bypass
- Simpler frontend integration

**Cons:**
- Slower user experience
- More server load
- Less immediate feedback

---

## 🚀 Implementation Steps

### For Approach 1 (Recommended):

1. ✅ Already implemented - just update your existing form components
2. Copy the code from "Approach 1" section above
3. Test with your existing product form

### For Approach 2:

1. Update ProductService with moderation check
2. Update ProductController error handling
3. Test with cURL or Postman

### Hybrid Approach (Best):

1. Add moderation check on frontend (Approach 1)
2. Add validation on backend (Approach 2)
3. Provides defense-in-depth - catches both UI bypasses and direct API calls

---

## 🧪 Testing the Integration

### Test Scenario 1: Valid Product

```bash
# Frontend should show success
# Backend should create product successfully
curl -X POST http://localhost:8585/api/products \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "title": "Beautiful Dress",
    "description": "High quality summer dress",
    "price": 29.99
  }'

# Expected: 201 Created
```

### Test Scenario 2: Invalid Product

```bash
# Frontend should show moderation error
# Backend should reject with 400
curl -X POST http://localhost:8585/api/products \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "title": "Stupid dress",
    "description": "Awful quality garbage",
    "price": 29.99
  }'

# Expected: 400 Bad Request with error message
```

---

## 📋 Checklist for Integration

- [ ] Add moderation check to your product creation form
- [ ] Import useModeration hook in your component
- [ ] Call checkContent before submitting
- [ ] Display moderation results to user
- [ ] Test with valid product title/description
- [ ] Test with toxic content (should be rejected)
- [ ] Verify error messages are user-friendly
- [ ] Test error states (API failures)
- [ ] Test edge cases (very long text, special characters)
- [ ] Update your existing product creation flow to use moderation
- [ ] Document any changes made
- [ ] Deploy and test in staging

---

## 🎯 Quick Reference

### Adding to Existing Product Form

```jsx
// 1. Import hook
import useModeration from '@/hooks/useModeration';

// 2. In component
const { checkContent, isChecking } = useModeration();

// 3. On submit
const handleSubmit = async () => {
  const result = await checkContent(title, description);
  if (result?.status === 'VALID') {
    // submit product
  } else {
    // show error
  }
};

// 4. In JSX
<button disabled={isChecking}>
  {isChecking ? 'Checking...' : 'Create Product'}
</button>
```

---

Generated for: Dressrosa PFE Project
Integration Guide Version: 1.0
