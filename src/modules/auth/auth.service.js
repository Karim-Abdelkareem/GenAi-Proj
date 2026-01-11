/**
 * Auth Service
 * Handles authentication business logic
 */

import User from "./user.model.js";
import { AppError } from "../../utils/AppError.js";
import { config } from "../../config/env.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt_secret, {
    expiresIn: config.jwt_expires_in,
  });
};

/**
 * Create and send token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @returns {Object} - Response with token
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt_cookie_expires_in * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: "strict",
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Created user
 */
export const register = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  return user;
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object
 */
export const login = async (email, password) => {
  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError("Please provide email and password!", 400);
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  // 3) Check if user is active
  if (!user.active) {
    throw new AppError("Your account has been deactivated", 403);
  }

  return user;
};

/**
 * Forgot password - send reset token
 * @param {string} email - User email
 * @returns {Promise<string>} - Reset token
 */
export const forgotPassword = async (email) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("There is no user with email address.", 404);
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

/**
 * Reset password
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} - User object
 */
export const resetPassword = async (token, password) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};

/**
 * Update password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Updated user
 */
export const updatePassword = async (userId, currentPassword, newPassword) => {
  // 1) Get user from collection
  const user = await User.findById(userId).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Your current password is wrong.", 401);
  }

  // 3) If so, update password
  user.password = newPassword;
  await user.save();

  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user
 */
export const updateProfile = async (userId, updateData) => {
  // Filter out fields that are not allowed to be updated
  const allowedFields = ["name", "email"];
  const filteredData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Get current user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

/**
 * Deactivate user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Updated user
 */
export const deactivateAccount = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { active: false },
    { new: true }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// Export helper functions for use in controller
export { createSendToken, signToken };

