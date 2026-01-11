/**
 * Auth Routes
 * Define all authentication routes
 */

import express from "express";
import {
  registerUser,
  loginUser,
  forgotPasswordHandler,
  resetPasswordHandler,
  updatePasswordHandler,
  updateProfileHandler,
  getMe,
  deactivateAccountHandler,
  logout,
} from "./auth.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validateRegister, validateLogin, validateResetPassword, validateUpdatePassword, validateUpdateProfile } from "./auth.validation.js";
import { AppError } from "../../utils/AppError.js";

const router = express.Router();

/**
 * Validation middleware
 */
const validate = (validator) => {
  return (req, res, next) => {
    const result = validator(req.body);
    if (!result.valid) {
      return next(new AppError(result.errors.join(", "), 400));
    }
    next();
  };
};

// Public routes
router.post("/register", validate(validateRegister), registerUser);
router.post("/login", validate(validateLogin), loginUser);
router.post("/forgot-password", forgotPasswordHandler);
router.patch("/reset-password/:token", validate(validateResetPassword), resetPasswordHandler);

// Protected routes (require authentication)
router.use(protect); // All routes below require authentication

router.get("/me", getMe);
router.patch("/update-password", validate(validateUpdatePassword), updatePasswordHandler);
router.patch("/update-profile", validate(validateUpdateProfile), updateProfileHandler);
router.delete("/deactivate", deactivateAccountHandler);
router.post("/logout", logout);

export default router;

