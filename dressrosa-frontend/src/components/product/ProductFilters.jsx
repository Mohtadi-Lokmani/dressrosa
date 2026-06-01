import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button';
import { SIZES, COLORS } from '../../utils/constants';

const ProductFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    size: true,
    color: true,
    price: true,
    rating: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSizeChange = (size) => {
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    onFilterChange({ sizes: newSizes });
  };

  const handleColorChange = (color) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
    onFilterChange({ colors: newColors });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value ? parseFloat(value) : null });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({ minRating: filters.minRating === rating ? null : rating });
  };

  const hasActiveFilters =
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating;

  return (
    <div className="space-y-10">
      {/* Size Filter */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full group"
        >
          <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Size</span>
          {expandedSections.size ? (
            <ChevronUp className="w-4 h-4 text-burgundy" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.size && (
          <div className="grid grid-cols-3 gap-3 animate-fade-in">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`px-4 py-3 text-[11px] font-black rounded-xl border-2 transition-all duration-300 ${
                  filters.sizes?.includes(size)
                    ? 'border-burgundy bg-burgundy text-white shadow-lg shadow-burgundy/20'
                    : 'border-gray-100 text-gray-400 hover:border-burgundy/30 hover:text-burgundy'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[1px] bg-gray-50"></div>

      {/* Color Filter */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full group"
        >
          <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Color</span>
          {expandedSections.color ? (
            <ChevronUp className="w-4 h-4 text-burgundy" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.color && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                  filters.colors?.includes(color.name)
                    ? 'border-burgundy bg-burgundy/5 text-burgundy'
                    : 'border-gray-100 text-gray-500 hover:border-burgundy/30'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-gray-100 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <span className="text-[11px] font-bold uppercase tracking-widest">{color.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[1px] bg-gray-50"></div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full group"
        >
          <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Price Range</span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-burgundy" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.price && (
          <div className="flex items-center space-x-4 animate-fade-in">
            <div className="flex-1">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handlePriceChange}
                placeholder="Min"
                className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-burgundy/10"
              />
            </div>
            <span className="text-gray-300">—</span>
            <div className="flex-1">
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handlePriceChange}
                placeholder="Max"
                className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-burgundy/10"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;