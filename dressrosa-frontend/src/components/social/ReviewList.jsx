import { useState } from 'react';
import ReviewCard from './ReviewCard';
import EmptyState from '../common/EmptyState';
import { MessageSquare } from 'lucide-react';

const ReviewList = ({ reviews = [], onDeleteReview, currentUserId }) => {
  const [sortBy, setSortBy] = useState('recent'); // recent, rating-high, rating-low

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'rating-high') {
      return b.rate - a.rate;
    } else if (sortBy === 'rating-low') {
      return a.rate - b.rate;
    }
    return 0;
  });

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to review this product!"
      />
    );
  }

  return (
    <div>
      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          All Reviews ({reviews.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy"
        >
          <option value="recent">Most Recent</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.reviewId}
            review={review}
            onDelete={onDeleteReview}
            canDelete={currentUserId === review.buyer?.userId}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;