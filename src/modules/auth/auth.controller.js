/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

import asyncHandler from "express-async-handler";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  getCurrentUser,
  deactivateAccount,
  createSendToken,
} from "./auth.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await register({ name, email, password });

  createSendToken(user, 201, res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await login(email, password);

  createSendToken(user, 200, res);
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset token
 * @access  Public
 */
export const forgotPasswordHandler = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const resetToken = await forgotPassword(email);

  // TODO: Send email with reset token
  // For now, we'll return it in the response (remove in production)
  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
    // Remove this in production - only for development
    resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
  });
});

/**
 * @route   PATCH /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
export const resetPasswordHandler = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await resetPassword(token, password);

  createSendToken(user, 200, res);
});

/**
 * @route   PATCH /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
export const updatePasswordHandler = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  const user = await updatePassword(userId, currentPassword, newPassword);

  createSendToken(user, 200, res);
});

/**
 * @route   PATCH /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfileHandler = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const updateData = req.body;

  const user = await updateProfile(userId, updateData);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await getCurrentUser(userId);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

/**
 * @route   DELETE /api/auth/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
export const deactivateAccountHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;

    await deactivateAccount(userId);

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully",
    });
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Private
 */
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

