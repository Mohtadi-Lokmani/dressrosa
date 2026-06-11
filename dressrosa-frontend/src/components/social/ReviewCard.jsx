import { MoreHorizontal, ThumbsUp } from 'lucide-react';
import Avatar from '../common/Avatar';
import RatingStars from './RatingStars';
import { formatRelativeTime } from '../../utils/formatters';

const ReviewCard = ({ review, onDelete, canDelete = false }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={review.buyer?.profilePhoto || review.buyer?.profileImage}
            name={review.buyer?.userName}
            size="md"
          />
          <div>
            <h4 className="font-semibold text-gray-900">
              {review.buyer?.userName || 'Anonymous'}
            </h4>
            <p className="text-sm text-gray-500">
              {formatRelativeTime(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RatingStars rating={review.rate} size="sm" />
          {canDelete && (
            <button
              onClick={() => onDelete(review.reviewId)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-gray-700 leading-relaxed mb-4">
          {review.comment}
        </p>
      )}

      {/* Review Actions */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-burgundy transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">Helpful</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;