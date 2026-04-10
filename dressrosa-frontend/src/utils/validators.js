/**
 * Validation helper functions
 */

export const validators = {
  /**
   * Validate email
   */
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validate password (min 6 characters)
   */
  password: (password) => {
    return password && password.length >= 6;
  },

  /**
   * Validate phone number
   */
  phone: (phone) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
  },

  /**
   * Validate required field
   */
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  /**
   * Validate min length
   */
  minLength: (value, min) => {
    return value && value.length >= min;
  },

  /**
   * Validate max length
   */
  maxLength: (value, max) => {
    return value && value.length <= max;
  },

  /**
   * Validate number range
   */
  range: (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  /**
   * Validate positive number
   */
  positiveNumber: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },

  /**
   * Validate URL
   */
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Form validation errors
 */
export const getValidationError = (field, value, rules = {}) => {
  if (rules.required && !validators.required(value)) {
    return `${field} is required`;
  }

  if (rules.email && value && !validators.email(value)) {
    return 'Please enter a valid email';
  }

  if (rules.password && value && !validators.password(value)) {
    return 'Password must be at least 6 characters';
  }

  if (rules.minLength && value && !validators.minLength(value, rules.minLength)) {
    return `${field} must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value && !validators.maxLength(value, rules.maxLength)) {
    return `${field} must be less than ${rules.maxLength} characters`;
  }

  if (rules.min && value && !validators.range(value, rules.min, Infinity)) {
    return `${field} must be at least ${rules.min}`;
  }

  if (rules.max && value && !validators.range(value, -Infinity, rules.max)) {
    return `${field} must be less than ${rules.max}`;
  }

  return null;
};

export default validators;