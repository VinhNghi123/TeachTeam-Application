"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateYear = exports.validateSemester = exports.sanitizeHtml = exports.validateArrayLength = exports.validateStringLength = exports.safeParseInt = exports.validateRanking = exports.capitalizeFirstLetter = exports.validateCourseCode = exports.validatePassword = exports.validateEmail = void 0;
/**
 * Validates if a string is a valid email address
 * @param email - Email string to validate
 * @returns Boolean indicating whether the email is valid
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
/**
 * Validates if a string is a strong password
 * @param password - Password string to validate
 * @returns Boolean indicating whether the password is valid
 */
const validatePassword = (password) => {
    // Password must be at least 8 characters, include uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
/**
 * Validates if a string matches the course code format (COSC followed by 4 digits)
 * @param code - Course code string to validate
 * @returns Boolean indicating whether the course code is valid
 */
const validateCourseCode = (code) => {
    const codeRegex = /^COSC[0-9]{4}$/;
    return codeRegex.test(code);
};
exports.validateCourseCode = validateCourseCode;
/**
 * Capitalizes the first letter of a string
 * @param string - String to capitalize
 * @returns Capitalized string
 */
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
/**
 * Validates a ranking value is between 1 and 5
 * @param ranking - Ranking value to validate
 * @returns Boolean indicating whether the ranking is valid
 */
const validateRanking = (ranking) => {
    return ranking >= 1 && ranking <= 5;
};
exports.validateRanking = validateRanking;
/**
 * Safely converts a string to a number, returning undefined if invalid
 * @param value - String value to convert
 * @returns Number or undefined
 */
const safeParseInt = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
};
exports.safeParseInt = safeParseInt;
/**
 * Validates the length of a string is within specified bounds
 * @param str - String to validate
 * @param minLength - Minimum allowed length
 * @param maxLength - Maximum allowed length
 * @returns Boolean indicating whether the string length is valid
 */
const validateStringLength = (str, minLength, maxLength) => {
    return str.length >= minLength && str.length <= maxLength;
};
exports.validateStringLength = validateStringLength;
/**
 * Validates if an array has elements and doesn't exceed a maximum length
 * @param arr - Array to validate
 * @param maxLength - Maximum allowed length
 * @returns Boolean indicating whether the array is valid
 */
const validateArrayLength = (arr, maxLength) => {
    return Array.isArray(arr) && arr.length > 0 && arr.length <= maxLength;
};
exports.validateArrayLength = validateArrayLength;
/**
 * Removes HTML tags from a string
 * @param str - String to sanitize
 * @returns Sanitized string
 */
const sanitizeHtml = (str) => {
    return str.replace(/<[^>]*>?/gm, '');
};
exports.sanitizeHtml = sanitizeHtml;
/**
 * Validates a semester string
 * @param semester - Semester string to validate
 * @returns Boolean indicating whether the semester is valid
 */
const validateSemester = (semester) => {
    const validSemesters = [
        'Semester 1',
        'Semester 2',
        'Summer',
        'Winter'
    ];
    return validSemesters.includes(semester);
};
exports.validateSemester = validateSemester;
/**
 * Validates a year is within reasonable range
 * @param year - Year to validate
 * @returns Boolean indicating whether the year is valid
 */
const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 1 && year <= currentYear + 2;
};
exports.validateYear = validateYear;
exports.default = {
    validateEmail: exports.validateEmail,
    validatePassword: exports.validatePassword,
    validateCourseCode: exports.validateCourseCode,
    capitalizeFirstLetter: exports.capitalizeFirstLetter,
    validateRanking: exports.validateRanking,
    safeParseInt: exports.safeParseInt,
    validateStringLength: exports.validateStringLength,
    validateArrayLength: exports.validateArrayLength,
    sanitizeHtml: exports.sanitizeHtml,
    validateSemester: exports.validateSemester,
    validateYear: exports.validateYear
};
//# sourceMappingURL=validation.js.map