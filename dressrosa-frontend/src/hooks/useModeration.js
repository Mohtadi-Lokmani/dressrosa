/**
 * useModerationHook - React Hook for Content Moderation
 * 
 * Provides a convenient hook for checking product content for toxicity.
 * Manages loading state, errors, and moderation results.
 * 
 * Usage:
 * const { checkContent, isChecking, error, result } = useModeration();
 * 
 * const handleCheck = async () => {
 *   const result = await checkContent(title, description);
 *   if (result?.status === 'VALID') {
 *     // Proceed with product creation
 *   }
 * };
 */

import { useState } from 'react';
import moderationService from '../services/moderationService';

export const useModeration = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const checkContent = async (title, description) => {
    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      // Call moderation service
      const moderationResult = await moderationService.checkProduct(title, description);
      
      // Store result
      setResult(moderationResult);
      
      // Return result for immediate use
      return moderationResult;
    } catch (err) {
      // Set error
      const errorMessage = err.message || 'Failed to check content moderation';
      setError(errorMessage);
      
      // Return error response
      return { status: 'ERROR', reason: errorMessage };
    } finally {
      setIsChecking(false);
    }
  };

  // Reset state
  const reset = () => {
    setError(null);
    setResult(null);
    setIsChecking(false);
  };

  return {
    checkContent,
    isChecking,
    error,
    result,
    reset
  };
};

export default useModeration;
