const RatingBreakdown = ({ reviews = [] }) => {
  // Calculate rating distribution
  const totalReviews = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    if (review.rate >= 1 && review.rate <= 5) {
      ratingCounts[review.rate]++;
    }
  });

  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rate, 0) / totalReviews
    : 0;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex items-center justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-2xl ${
                i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Bars */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingCounts[star];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm text-gray-600">{star}</span>
                <span className="text-yellow-400 text-sm">★</span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingBreakdown;