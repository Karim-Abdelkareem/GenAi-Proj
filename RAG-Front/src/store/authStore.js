import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getTokenInfo,
  validateToken,
  isTokenExpired,
} from "../utils/tokenUtils";

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      documentData: null,
      interviewQuestions: null,
      isAuthenticated: false,

      setAuth: (token, user, documentData = null) => {
        set({
          token,
          user,
          documentData: documentData || user?.document || null,
          isAuthenticated: true,
        });
      },

      getTokenInfo: () => {
        const token = get().token;
        return getTokenInfo(token);
      },

      isTokenValid: () => {
        const token = get().token;
        if (!token) return false;
        return validateToken(token) && !isTokenExpired(token);
      },

      getTokenPreview: () => {
        const token = get().token;
        if (!token) return "No token";
        return token.substring(0, 20) + "...";
      },

      updateDocumentData: (documentData) => {
        set({
          documentData,
        });
      },

      clearDocumentData: () => {
        set({
          documentData: null,
        });
      },

      setInterviewQuestions: (questions) => {
        set({
          interviewQuestions: questions,
        });
      },

      clearInterviewQuestions: () => {
        set({
          interviewQuestions: null,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          documentData: null,
          interviewQuestions: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
