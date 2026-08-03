/**
 * Validators — Regex & form validation utilities for RedDrop AI V2
 */

/** Valid blood group strings */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/** Validate email format */
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Validate Indian 10-digit mobile number (starts with 6-9) */
export const isValidPhone = (value) => /^[6-9]\d{9}$/.test(value);

/** Validate password (min 8 chars, at least one letter and one number) */
export const isValidPassword = (value) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

/** Validate blood group string */
export const isValidBloodGroup = (value) => BLOOD_GROUPS.includes(value);

/** Validate a 6-digit numeric OTP */
export const isValidOtp = (value) => /^\d{6}$/.test(value);

/** Validate latitude is in range [-90, 90] */
export const isValidLatitude = (value) => typeof value === 'number' && value >= -90 && value <= 90;

/** Validate longitude is in range [-180, 180] */
export const isValidLongitude = (value) => typeof value === 'number' && value >= -180 && value <= 180;
