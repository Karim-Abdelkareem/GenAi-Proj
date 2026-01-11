/**
 * CV Analysis Controller
 * Handles HTTP requests for CV insights, skills gap, and resume suggestions
 */

import asyncHandler from "express-async-handler";
import {
  generateCVInsights,
  analyzeSkillsGap,
  getResumeSuggestions,
} from "./cv-analysis.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Get CV Insights
 * GET /api/v1/cv/insights
 */
export const getCVInsights = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const insights = await generateCVInsights(userId);

  res.json({
    status: "success",
    data: insights,
  });
});

/**
 * Analyze Skills Gap
 * POST /api/v1/cv/skills-gap
 * Body: { targetRole: "string" }
 */
export const getSkillsGap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { targetRole } = req.body;

  if (!targetRole || targetRole.trim().length === 0) {
    throw new AppError("Target role is required", 400);
  }

  const analysis = await analyzeSkillsGap(userId, targetRole);

  res.json({
    status: "success",
    data: analysis,
  });
});

/**
 * Get Resume Suggestions
 * POST /api/v1/cv/resume-suggestions
 * Body: { section?: "summary" | "experience" | "skills" | "education" | "all" }
 */
export const getResumeBuilderSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { section = "all" } = req.body;

  const validSections = ["summary", "experience", "skills", "education", "all"];
  if (!validSections.includes(section)) {
    throw new AppError(
      `Invalid section. Must be one of: ${validSections.join(", ")}`,
      400
    );
  }

  const suggestions = await getResumeSuggestions(userId, section);

  res.json({
    status: "success",
    data: suggestions,
  });
});

