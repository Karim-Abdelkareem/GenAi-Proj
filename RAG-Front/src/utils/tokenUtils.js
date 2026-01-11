/**
 * Token validation and debugging utilities
 */

/**
 * Check if token exists and has valid format
 * @param {string} token - JWT token
 * @returns {boolean} - True if token exists and has valid format
 */
export const validateToken = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  // JWT tokens have 3 parts separated by dots
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // Check if parts are base64 encoded
  try {
    parts.forEach((part) => {
      if (part.length === 0) {
        throw new Error("Empty token part");
      }
      // Basic base64 check
      atob(part);
    });
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Decode JWT payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!validateToken(token)) {
    return null;
  }

  try {
    const parts = token.split(".");
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true; // Consider invalid tokens as expired
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  return expirationTime < currentTime;
};

/**
 * Get comprehensive token information for debugging
 * @param {string} token - JWT token
 * @returns {object} - Token information object
 */
export const getTokenInfo = (token) => {
  const info = {
    exists: !!token,
    length: token?.length || 0,
    isValidFormat: false,
    isExpired: true,
    expiresAt: null,
    expiresIn: null,
    payload: null,
    preview: token ? `${token.substring(0, 20)}...` : null,
  };

  if (!token) {
    return info;
  }

  info.isValidFormat = validateToken(token);
  
  if (info.isValidFormat) {
    const payload = decodeToken(token);
    info.payload = payload;

    if (payload && payload.exp) {
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      info.expiresAt = new Date(expirationTime);
      info.isExpired = expirationTime < currentTime;
      info.expiresIn = expirationTime - currentTime;
    }
  }

  return info;
};

/**
 * Get token preview for logging (first 20 chars)
 * @param {string} token - JWT token
 * @returns {string} - Token preview
 */
export const getTokenPreview = (token) => {
  if (!token) return "No token";
  return `${token.substring(0, 20)}...`;
};












