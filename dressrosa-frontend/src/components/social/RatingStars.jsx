const RatingStars = ({ rating, size = 'md', showNumber = false, interactive = false, onRate }) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const stars = [1, 2, 3, 4, 5];

  const handleClick = (star) => {
    if (interactive && onRate) {
      onRate(star);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`${sizes[size]} ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
          } ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;