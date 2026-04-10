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
    <div className="bg-white rounded-xl p-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-burgundy hover:text-burgundy-dark flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Size Filter */}
        <div>
          <button
            onClick={() => toggleSection('size')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium text-gray-900">Size</span>
            {expandedSections.size ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.size && (
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    filters.sizes?.includes(size)
                      ? 'border-burgundy bg-burgundy text-white'
                      : 'border-gray-300 hover:border-burgundy'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Color Filter */}
        <div>
          <button
            onClick={() => toggleSection('color')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium text-gray-900">Color</span>
            {expandedSections.color ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.color && (
            <div className="space-y-2">
              {COLORS.map((color) => (
                <label
                  key={color.name}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.colors?.includes(color.name) || false}
                    onChange={() => handleColorChange(color.name)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        filters.colors?.includes(color.name)
                          ? 'border-burgundy ring-2 ring-burgundy ring-offset-2'
                          : 'border-gray-300 group-hover:border-burgundy'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <span className="text-sm text-gray-700">{color.name}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Price Range Filter */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium text-gray-900">Price Range</span>
            {expandedSections.price ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.price && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Price ($)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice || ''}
                  onChange={handlePriceChange}
                  placeholder="0"
                  min="0"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Price ($)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice || ''}
                  onChange={handlePriceChange}
                  placeholder="1000"
                  min="0"
                  className="input text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Rating Filter */}
        <div>
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium text-gray-900">Ratings</span>
            {expandedSections.rating ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.rating && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      filters.minRating === rating
                        ? 'border-burgundy bg-burgundy'
                        : 'border-gray-300 group-hover:border-burgundy'
                    }`}
                  >
                    {filters.minRating === rating && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">& Up</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;