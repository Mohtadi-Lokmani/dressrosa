import { User } from 'lucide-react';
import { getInitials } from '../../utils/formatters';
import { getImageUrl } from '../../utils/helpers';

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {src ? (
        <img
          src={getImageUrl(src)}
          alt={alt || name || 'Avatar'}
          className={`
            ${sizes[size]}
            ${shapes[shape]}
            object-cover
          `}
        />
      ) : (
        <div
          className={`
            ${sizes[size]}
            ${shapes[shape]}
            bg-gradient-to-br from-burgundy to-burgundy-light
            flex items-center justify-center
            text-white font-semibold
          `}
        >
          {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
        </div>
      )}

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full
            border-2 border-white
          `}
        />
      )}
    </div>
  );
};

export default Avatar;