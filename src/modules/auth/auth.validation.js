/**
 * Auth Validation
 * Validation schemas for authentication endpoints
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }

  return { valid: true };
};

/**
 * Validate registration data
 * @param {Object} data - Registration data
 * @returns {Object} - Validation result
 */
export const validateRegister = (data) => {
  const { name, email, password } = data;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!email || !isValidEmail(email)) {
    errors.push("Please provide a valid email");
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login data
 * @param {Object} data - Login data
 * @returns {Object} - Validation result
 */
export const validateLogin = (data) => {
  const { email, password } = data;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password reset data
 * @param {Object} data - Password reset data
 * @returns {Object} - Validation result
 */
export const validateResetPassword = (data) => {
  const { password } = data;
  const errors = [];

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate update password data
 * @param {Object} data - Update password data
 * @returns {Object} - Validation result
 */
export const validateUpdatePassword = (data) => {
  const { currentPassword, newPassword } = data;
  const errors = [];

  if (!currentPassword) {
    errors.push("Current password is required");
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }

  if (currentPassword === newPassword) {
    errors.push("New password must be different from current password");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate update profile data
 * @param {Object} data - Update profile data
 * @returns {Object} - Validation result
 */
export const validateUpdateProfile = (data) => {
  const { name, email } = data;
  const errors = [];

  if (name !== undefined && name.trim().length === 0) {
    errors.push("Name cannot be empty");
  }

  if (email !== undefined && !isValidEmail(email)) {
    errors.push("Please provide a valid email");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

