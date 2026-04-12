import { useState } from 'react';
import RatingStars from './RatingStars';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onSubmit, loading = false }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await onSubmit({ rate: rating, comment: comment.trim() || null });
      // Reset form
      setRating(0);
      setComment('');
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Write a Review
      </h3>

      {/* Rating Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <RatingStars
          rating={rating}
          size="xl"
          interactive
          onRate={setRating}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={rating === 0}
      >
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;