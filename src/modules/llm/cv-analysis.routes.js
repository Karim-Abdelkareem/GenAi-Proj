/**
 * CV Analysis Routes
 */

import { Router } from "express";
import {
  getCVInsights,
  getSkillsGap,
  getResumeBuilderSuggestions,
} from "./cv-analysis.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// CV Insights
router.get("/insights", protect, getCVInsights);

// Skills Gap Analysis
router.post("/skills-gap", protect, getSkillsGap);

// Resume Builder Suggestions
router.post("/resume-suggestions", protect, getResumeBuilderSuggestions);

export default router;

