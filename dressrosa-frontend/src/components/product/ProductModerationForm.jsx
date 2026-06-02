/**
 * ProductModerationForm - React Component
 * 
 * Example of how to integrate AI moderation into product creation form.
 * 
 * Features:
 * - Real-time title/description validation
 * - Moderation check before submission
 * - Clear user feedback with warnings
 * - Debounced API calls to avoid rate limiting
 * 
 * Usage:
 * <ProductModerationForm onProductCreated={handleSuccess} />
 */

import React, { useState } from 'react';
import useModeration from '../../hooks/useModeration';
import useDebounce from '../../hooks/useDebounce';
import productService from '../../services/productService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';

const ProductModerationForm = ({ onProductCreated }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: null,
    variants: [],
    imageUrls: [],
    videoUrls: []
  });

  // Moderation state
  const { checkContent, isChecking, error: moderationError, result: moderationResult } = useModeration();

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showModerationWarning, setShowModerationWarning] = useState(false);

  // Debounce title and description for real-time validation
  const debouncedTitle = useDebounce(formData.title, 1000);
  const debouncedDescription = useDebounce(formData.description, 1000);
  const [autoCheckWarnings, setAutoCheckWarnings] = useState([]);

  // Auto-check for warnings on title/description change
  React.useEffect(() => {
    const performAutoCheck = async () => {
      if (debouncedTitle && debouncedDescription) {
        // Optional: Do a preview check without blocking submission
        // This is a "warning" not a "block"
        const result = await checkContent(debouncedTitle, debouncedDescription);
        if (result?.status === 'INVALID') {
          setAutoCheckWarnings([result.reason]);
        } else {
          setAutoCheckWarnings([]);
        }
      }
    };

    performAutoCheck();
  }, [debouncedTitle, debouncedDescription]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle pre-submission moderation check
  const handleModerationCheck = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError('Title and description are required');
      return;
    }

    // Check moderation
    const result = await checkContent(formData.title, formData.description);
    
    if (result?.status === 'INVALID') {
      // Show warning modal
      setShowModerationWarning(true);
      return;
    }

    // Moderation passed - proceed to submission
    await handleSubmitProduct();
  };

  // Handle product submission
  const handleSubmitProduct = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Call product service to create product
      const response = await productService.createProduct(formData);
      
      // Success
      setFormData({
        title: '',
        description: '',
        price: '',
        categoryId: null,
        variants: [],
        imageUrls: [],
        videoUrls: []
      });

      // Notify parent component
      if (onProductCreated) {
        onProductCreated(response);
      }

      // Show success message
      alert('Product created successfully!');
    } catch (error) {
      setSubmitError(error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      setShowModerationWarning(false);
    }
  };

  // Render moderation status badge
  const renderModerationStatus = () => {
    if (!moderationResult && autoCheckWarnings.length === 0) {
      return null;
    }

    if (autoCheckWarnings.length > 0) {
      return (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
          <strong>⚠️ Warning:</strong> {autoCheckWarnings[0]}
          <p className="mt-1 text-xs">You can still submit, but please review your content.</p>
        </div>
      );
    }

    if (moderationResult?.status === 'VALID') {
      return (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          <strong>✅ Content Approved:</strong> Your product content has passed moderation checks.
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

        {/* Title Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Title
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter product title (max 200 characters)"
            maxLength={200}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Description Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your product..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Moderation Status */}
        {renderModerationStatus()}

        {/* Price Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter product price"
            step="0.01"
            min="0"
            className="w-full"
          />
        </div>

        {/* Error Messages */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            <strong>Error:</strong> {submitError}
          </div>
        )}

        {moderationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            <strong>Moderation Error:</strong> {moderationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleModerationCheck}
            disabled={isSubmitting || isChecking}
            className="flex-1"
            variant="primary"
          >
            {isSubmitting ? (
              <>
                <Loading className="inline-block mr-2" />
                Creating Product...
              </>
            ) : isChecking ? (
              <>
                <Loading className="inline-block mr-2" />
                Checking Content...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          <Button
            onClick={() => setFormData({
              title: '',
              description: '',
              price: '',
              categoryId: null,
              variants: [],
              imageUrls: [],
              videoUrls: []
            })}
            variant="secondary"
          >
            Clear
          </Button>
        </div>

        {/* Moderation Warning Modal */}
        {showModerationWarning && (
          <Modal
            isOpen={showModerationWarning}
            onClose={() => setShowModerationWarning(false)}
            title="Content Moderation Issue"
          >
            <div className="mb-4">
              <p className="text-red-600 font-medium">
                {moderationResult?.reason}
              </p>
              {moderationResult?.flaggedField && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Flagged field:</strong> {moderationResult.flaggedField}
                </p>
              )}
              {moderationResult?.toxicityScore && (
                <p className="text-sm text-gray-600">
                  <strong>Toxicity Score:</strong> {(moderationResult.toxicityScore * 100).toFixed(1)}%
                </p>
              )}
              <p className="text-sm text-gray-700 mt-4">
                Please review your product title and description and remove any inappropriate content.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowModerationWarning(false)}
                variant="primary"
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleSubmitProduct}
                variant="secondary"
                className="flex-1"
              >
                Force Submit Anyway
              </Button>
            </div>
          </Modal>
        )}
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
        <strong>ℹ️ AI-Powered Content Moderation</strong>
        <p className="mt-2">
          Your product title and description are automatically checked using AI to ensure they follow community guidelines.
          Inappropriate content may be rejected. This helps keep our marketplace safe and professional.
        </p>
      </div>
    </div>
  );
};

export default ProductModerationForm;
