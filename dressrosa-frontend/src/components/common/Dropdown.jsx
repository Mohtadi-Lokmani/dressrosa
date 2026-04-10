import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span>Select</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 min-w-[200px]
            bg-white rounded-xl shadow-xl border border-gray-200
            py-2 z-50
            animate-slide-in
            ${alignments[align]}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Dropdown Item Component
export const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  danger = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center space-x-3 px-4 py-2.5
        hover:bg-gray-50 transition-colors text-left
        ${danger ? 'text-red-600' : 'text-gray-700'}
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};

export default Dropdown;