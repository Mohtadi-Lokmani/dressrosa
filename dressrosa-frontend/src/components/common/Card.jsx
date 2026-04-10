const Card = ({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-sm transition-all duration-200';
  const paddingStyles = padding ? 'p-6' : '';
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${paddingStyles}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;