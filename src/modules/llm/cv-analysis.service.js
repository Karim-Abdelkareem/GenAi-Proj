/**
 * CV Analysis Service
 * Provides CV insights, skills gap analysis, and resume suggestions
 */

import { ChatOpenAI } from "@langchain/openai";
import { AppError } from "../../utils/AppError.js";
import User from "../auth/user.model.js";
import { getAllCVChunks } from "../vectors/vector.service.js";

const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.3,
});

const structuredOpenAI = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
  temperature: 0,
});

/**
 * Generate CV Insights
 * Analyzes CV and provides strengths, weaknesses, and recommendations
 */
export async function generateCVInsights(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.document || user.document.chunksIds.length === 0) {
    throw new AppError(
      "No document uploaded yet. Please upload a document first.",
      404
    );
  }

  // Get all CV chunks
  const cvChunks = await getAllCVChunks(userId);
  const cvContext = cvChunks.join("\n\n---\n\n");

  // Extract user data
  const technicalSkills = user.document.technicalSkills || [];
  const yearsOfExperience = user.document.yearsOfExperience || 0;
  const education = user.document.education || [];
  const personalInfo = user.document.personalInformation || {};

  const prompt = `You are an expert CV analyst. Analyze this CV and provide comprehensive insights.

CV Content:
${cvContext}

User Profile:
- Technical Skills: ${technicalSkills.join(", ") || "Not specified"}
- Years of Experience: ${yearsOfExperience} years
- Education: ${education.length > 0 ? education.map(e => `${e.degree} in ${e.field}`).join(", ") : "Not specified"}
${personalInfo.summary ? `- Summary: ${personalInfo.summary}` : ""}

Provide a detailed analysis in the following JSON format:
{
  "strengths": [
    "Strength 1 with specific examples from CV",
    "Strength 2 with specific examples from CV",
    "Strength 3 with specific examples from CV",
    "Strength 4 with specific examples from CV",
    "Strength 5 with specific examples from CV"
  ],
  "weaknesses": [
    "Weakness 1 with specific areas to improve",
    "Weakness 2 with specific areas to improve",
    "Weakness 3 with specific areas to improve"
  ],
  "skillsSummary": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"]
  },
  "experienceHighlights": [
    "Highlight 1 from work experience",
    "Highlight 2 from work experience",
    "Highlight 3 from work experience"
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3",
    "Specific recommendation 4",
    "Specific recommendation 5"
  ],
  "overallScore": 85,
  "summary": "One paragraph overall assessment"
}

Be specific and reference actual content from the CV. Return ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await structuredOpenAI.invoke(prompt);
    let insights;

    // Parse JSON response
    const content = response.content.trim();
    const jsonContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      insights = JSON.parse(jsonContent);
    } catch (parseError) {
      // Try to extract JSON from response if wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new AppError("Failed to parse insights from AI response", 500);
      }
    }

    // Validate structure
    if (!insights.strengths || !Array.isArray(insights.strengths)) {
      throw new AppError("Invalid insights structure: missing strengths", 500);
    }

    return insights;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to generate CV insights: ${error.message}`,
      500
    );
  }
}

/**
 * Analyze Skills Gap
 * Compares user's skills with target role requirements
 */
export async function analyzeSkillsGap(userId, targetRole) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.document || user.document.chunksIds.length === 0) {
    throw new AppError(
      "No document uploaded yet. Please upload a document first.",
      404
    );
  }

  if (!targetRole || targetRole.trim().length === 0) {
    throw new AppError("Target role is required", 400);
  }

  // Get CV context
  const cvChunks = await getAllCVChunks(userId);
  const cvContext = cvChunks.join("\n\n---\n\n");

  const technicalSkills = user.document.technicalSkills || [];
  const yearsOfExperience = user.document.yearsOfExperience || 0;

  const prompt = `You are a career advisor. Analyze the skills gap between this CV and the target role.

CV Content:
${cvContext}

Current Skills: ${technicalSkills.join(", ") || "Not specified"}
Years of Experience: ${yearsOfExperience} years

Target Role: ${targetRole}

Provide analysis in this JSON format:
{
  "matchingSkills": [
    {
      "skill": "skill name",
      "proficiency": "high|medium|low",
      "evidence": "where it appears in CV"
    }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "importance": "critical|high|medium|low",
      "description": "why this skill is needed"
    }
  ],
  "learningPath": [
    {
      "skill": "skill name",
      "priority": 1,
      "resources": ["resource 1", "resource 2"],
      "estimatedTime": "time estimate"
    }
  ],
  "matchScore": 75,
  "summary": "Overall assessment of skills gap"
}

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await structuredOpenAI.invoke(prompt);
    let analysis;

    const content = response.content.trim();
    const jsonContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new AppError("Failed to parse skills gap analysis", 500);
      }
    }

    // Validate structure
    if (!analysis.matchingSkills || !Array.isArray(analysis.matchingSkills)) {
      throw new AppError("Invalid analysis structure", 500);
    }

    return analysis;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to analyze skills gap: ${error.message}`,
      500
    );
  }
}

/**
 * Get Resume Builder Suggestions
 * Provides specific suggestions to improve CV sections
 */
export async function getResumeSuggestions(userId, section = "all") {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.document || user.document.chunksIds.length === 0) {
    throw new AppError(
      "No document uploaded yet. Please upload a document first.",
      404
    );
  }

  // Get CV context
  const cvChunks = await getAllCVChunks(userId);
  const cvContext = cvChunks.join("\n\n---\n\n");

  const sections = {
    summary: "professional summary",
    experience: "work experience descriptions",
    skills: "skills section",
    education: "education section",
    all: "overall CV",
  };

  const sectionName = sections[section] || sections.all;

  const prompt = `You are a professional resume writer. Provide specific, actionable suggestions to improve the ${sectionName} section of this CV.

CV Content:
${cvContext}

Provide suggestions in this JSON format:
{
  "section": "${section}",
  "currentState": "Brief description of current state",
  "suggestions": [
    {
      "issue": "Specific issue identified",
      "suggestion": "Specific improvement suggestion",
      "example": "Example of improved version",
      "priority": "high|medium|low"
    }
  ],
  "bestPractices": [
    "Best practice 1 for this section",
    "Best practice 2 for this section",
    "Best practice 3 for this section"
  ],
  "beforeAfter": {
    "before": "Example of current phrasing",
    "after": "Improved version"
  },
  "summary": "Overall assessment and next steps"
}

Be specific and reference actual content from the CV. Return ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await structuredOpenAI.invoke(prompt);
    let suggestions;

    const content = response.content.trim();
    const jsonContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      suggestions = JSON.parse(jsonContent);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new AppError("Failed to parse resume suggestions", 500);
      }
    }

    // Validate structure
    if (!suggestions.suggestions || !Array.isArray(suggestions.suggestions)) {
      throw new AppError("Invalid suggestions structure", 500);
    }

    return suggestions;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to generate resume suggestions: ${error.message}`,
      500
    );
  }
}

