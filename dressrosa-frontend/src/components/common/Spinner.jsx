const Spinner = ({ size = 'md', color = 'burgundy' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    burgundy: 'border-burgundy/20 border-t-burgundy',
    white: 'border-white/20 border-t-white',
    gray: 'border-gray-300 border-t-gray-600',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        ${colors[color]}
        rounded-full animate-spin
      `}
    />
  );
};

export default Spinner;