
/**
 * Validates if a string is a valid email address
 * @param email - Email string to validate
 * @returns Boolean indicating whether the email is valid
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates if a string is a strong password
   * @param password - Password string to validate
   * @returns Boolean indicating whether the password is valid
   */
  export const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters, include uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * Validates if a string matches the course code format (COSC followed by 4 digits)
   * @param code - Course code string to validate
   * @returns Boolean indicating whether the course code is valid
   */
  export const validateCourseCode = (code: string): boolean => {
    const codeRegex = /^COSC[0-9]{4}$/;
    return codeRegex.test(code);
  };
  
  /**
   * Capitalizes the first letter of a string
   * @param string - String to capitalize
   * @returns Capitalized string
   */
  export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  /**
   * Validates a ranking value is between 1 and 5
   * @param ranking - Ranking value to validate
   * @returns Boolean indicating whether the ranking is valid
   */
  export const validateRanking = (ranking: number): boolean => {
    return ranking >= 1 && ranking <= 5;
  };
  
  /**
   * Safely converts a string to a number, returning undefined if invalid
   * @param value - String value to convert
   * @returns Number or undefined
   */
  export const safeParseInt = (value: string): number | undefined => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  /**
   * Validates the length of a string is within specified bounds
   * @param str - String to validate
   * @param minLength - Minimum allowed length
   * @param maxLength - Maximum allowed length
   * @returns Boolean indicating whether the string length is valid
   */
  export const validateStringLength = (
    str: string,
    minLength: number,
    maxLength: number
  ): boolean => {
    return str.length >= minLength && str.length <= maxLength;
  };
  
  /**
   * Validates if an array has elements and doesn't exceed a maximum length
   * @param arr - Array to validate
   * @param maxLength - Maximum allowed length
   * @returns Boolean indicating whether the array is valid
   */
  export const validateArrayLength = (
    arr: any[],
    maxLength: number
  ): boolean => {
    return Array.isArray(arr) && arr.length > 0 && arr.length <= maxLength;
  };
  
  /**
   * Removes HTML tags from a string
   * @param str - String to sanitize
   * @returns Sanitized string
   */
  export const sanitizeHtml = (str: string): string => {
    return str.replace(/<[^>]*>?/gm, '');
  };
  
  /**
   * Validates a semester string
   * @param semester - Semester string to validate
   * @returns Boolean indicating whether the semester is valid
   */
  export const validateSemester = (semester: string): boolean => {
    const validSemesters = [
      'Semester 1',
      'Semester 2',
      'Summer',
      'Winter'
    ];
    
    return validSemesters.includes(semester);
  };
  
  /**
   * Validates a year is within reasonable range
   * @param year - Year to validate
   * @returns Boolean indicating whether the year is valid
   */
  export const validateYear = (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 1 && year <= currentYear + 2;
  };
  
  export default {
    validateEmail,
    validatePassword,
    validateCourseCode,
    capitalizeFirstLetter,
    validateRanking,
    safeParseInt,
    validateStringLength,
    validateArrayLength,
    sanitizeHtml,
    validateSemester,
    validateYear
  };