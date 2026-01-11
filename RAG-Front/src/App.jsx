import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import LandingPage from "./pages/landingPage";
import Home from "./pages/home";
import Profile from "./pages/profile";
import InterviewPreparation from "./pages/interviewPreparation";
import InterviewSession from "./pages/interviewSession";
import InterviewReportPage from "./pages/interviewReport";
import CVAnalysis from "./pages/cvAnalysis";
import useAuthStore from "./store/authStore";
import "./App.css";

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-prep"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InterviewPreparation />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-session"
        element={
          <ProtectedRoute>
            <InterviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/report/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cv-analysis"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CVAnalysis />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/home" : "/landing"} replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#0ea5e9",
          colorBgBase: "#09090b",
          colorBgContainer: "rgba(39, 39, 42, 0.7)",
          colorBgElevated: "rgba(39, 39, 42, 0.95)",
          colorBorder: "rgba(255, 255, 255, 0.08)",
          colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          colorTextTertiary: "#71717a",
          borderRadius: 12,
        },
        components: {
          Card: {
            colorBgContainer: "rgba(39, 39, 42, 0.7)",
          },
          Modal: {
            contentBg: "rgba(39, 39, 42, 0.95)",
            headerBg: "rgba(39, 39, 42, 0.95)",
          },
          Dropdown: {
            colorBgElevated: "rgba(39, 39, 42, 0.95)",
          },
          Select: {
            colorBgContainer: "rgba(39, 39, 42, 0.9)",
            colorBgElevated: "rgba(39, 39, 42, 0.95)",
          },
          Input: {
            colorBgContainer: "rgba(39, 39, 42, 0.9)",
          },
          Collapse: {
            colorBgContainer: "rgba(39, 39, 42, 0.7)",
            headerBg: "rgba(39, 39, 42, 0.9)",
          },
          Progress: {
            remainingColor: "rgba(255, 255, 255, 0.1)",
          },
          Upload: {
            colorFillAlter: "rgba(14, 165, 233, 0.05)",
          },
          Message: {
            contentBg: "rgba(39, 39, 42, 0.95)",
          },
        },
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
