/**
 * CV Analysis API Service
 * Handles CV insights, skills gap analysis, and resume suggestions
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get authentication token from localStorage
 */
function getToken() {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || parsed?.token;
    }
  } catch (e) {
    console.error("Error parsing auth storage:", e);
  }
  return null;
}

/**
 * Get CV Insights
 * @returns {Promise<object>} CV insights data
 */
export const getCVInsights = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${BASE_URL}/api/v1/cv/insights`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get CV insights" }));
    throw new Error(error.message || "Failed to get CV insights");
  }

  const data = await response.json();
  return data.data;
};

/**
 * Analyze Skills Gap
 * @param {string} targetRole - Target role/job title
 * @returns {Promise<object>} Skills gap analysis data
 */
export const analyzeSkillsGap = async (targetRole) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  if (!targetRole || targetRole.trim().length === 0) {
    throw new Error("Target role is required");
  }

  const response = await fetch(`${BASE_URL}/api/v1/cv/skills-gap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetRole }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to analyze skills gap" }));
    throw new Error(error.message || "Failed to analyze skills gap");
  }

  const data = await response.json();
  return data.data;
};

/**
 * Get Resume Suggestions
 * @param {string} section - Section to analyze: "summary" | "experience" | "skills" | "education" | "all"
 * @returns {Promise<object>} Resume suggestions data
 */
export const getResumeSuggestions = async (section = "all") => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const validSections = ["summary", "experience", "skills", "education", "all"];
  if (!validSections.includes(section)) {
    throw new Error(`Invalid section. Must be one of: ${validSections.join(", ")}`);
  }

  const response = await fetch(`${BASE_URL}/api/v1/cv/resume-suggestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ section }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get resume suggestions" }));
    throw new Error(error.message || "Failed to get resume suggestions");
  }

  const data = await response.json();
  return data.data;
};

