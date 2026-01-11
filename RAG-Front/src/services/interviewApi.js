/**
 * Interview API Service
 * REST API client for interview session management
 * Handles authentication and provides methods for session CRUD operations
 * @module services/interviewApi
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE_URL = `${BASE_URL}/api/v1/interview`;

/**
 * Axios instance configured for interview API
 * Automatically adds JWT token to all requests via interceptor
 */
const interviewApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
interviewApi.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token || parsed?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error parsing auth storage:", e);
    }
  }
  return config;
});

/**
 * Interview Service
 * Provides methods for managing interview sessions via REST API
 */
export const interviewService = {
  /**
   * Get all interview sessions for the authenticated user
   * @returns {Promise<object>} - Response containing sessions array
   * @throws {Error} - If request fails
   */
  getSessions: async () => {
    const response = await interviewApi.get("sessions");
    return response.data;
  },

  /**
   * Get specific interview session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} - Response containing session details with transcript
   * @throws {Error} - If request fails or session not found
   */
  getSession: async (sessionId) => {
    const response = await interviewApi.get(`sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Delete an interview session
   * @param {string} sessionId - Session ID to delete
   * @returns {Promise<object>} - Success message
   * @throws {Error} - If request fails or session not found
   */
  deleteSession: async (sessionId) => {
    const response = await interviewApi.delete(`sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Get interview preparation questions
   * @returns {Promise<object>} - Response containing interview questions array
   * @throws {Error} - If request fails
   */
  getQuestions: async () => {
    try {
      const response = await interviewApi.post("questions", {});
      console.log("Questions API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  /**
   * Get comprehensive interview report with evaluation data
   * NOTE: This endpoint is for LiveKit (voice interview) feature, not part of the standard text interview API
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} - Response containing final report with scores, Q/A pairs, and recommendations
   * @throws {Error} - If request fails or session not found
   */
  getInterviewReport: async (sessionId) => {
    const response = await interviewApi.get(
      `livekit/session/${sessionId}/report`
    );
    return response.data;
  },
};

export default interviewService;

const API_URL = "http://localhost:3000/api/v1/interview";

export async function startInterview(payload) {
  const res = await axios.post(`${API_URL}/start`, payload, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${
        JSON.parse(localStorage.getItem("auth-storage"))?.state?.token
      }`,
    },
  });

  return res.data.data;
}
