import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { loginUser } from "../api/auth";
import useAuthStore from "../store/authStore";

export default function Login() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (data) => {
      if (data.status === "success" && data.token && data.data?.user) {
        const user = data.data.user;
        const documentData = user.document || null;
        setAuth(data.token, user, documentData);
        message.success("Login successful!");
        navigate("/home");
      } else {
        setError("Invalid response from server");
      }
    },
    onError: (error) => {
      setError(error.message || "Login failed. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div
      style={{
        background: "rgba(39, 39, 42, 0.6)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "48px",
        boxShadow: "0 4px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(14, 165, 233, 0.4)",
          }}
        >
          <svg
            style={{ width: "40px", height: "40px", color: "white" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 700,
            margin: "0 0 8px 0",
            background: "linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Welcome Back
        </h2>
        <p style={{ margin: 0, color: "#71717a", fontSize: "15px" }}>
          Sign in to continue to your account
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderLeft: "3px solid #ef4444",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#fca5a5",
              fontSize: "14px",
            }}
          >
            <svg
              style={{ width: "20px", height: "20px", flexShrink: 0 }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email Input */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#71717a",
              }}
            >
              <svg
                style={{ width: "20px", height: "20px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                background: "rgba(9, 9, 11, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                color: "#fafafa",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(14, 165, 233, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#71717a",
              }}
            >
              <svg
                style={{ width: "20px", height: "20px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                background: "rgba(9, 9, 11, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                color: "#fafafa",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(14, 165, 233, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          style={{
            width: "100%",
            padding: "16px",
            marginTop: "28px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
            border: "none",
            borderRadius: "14px",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loginMutation.isPending ? "not-allowed" : "pointer",
            opacity: loginMutation.isPending ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!loginMutation.isPending) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(14, 165, 233, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(14, 165, 233, 0.4)";
          }}
        >
          {loginMutation.isPending ? (
            <>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <svg
                style={{ width: "20px", height: "20px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>

        {/* Sign up link */}
        <p style={{ textAlign: "center", marginTop: "24px", color: "#71717a", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#38bdf8",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#7dd3fc")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#38bdf8")}
          >
            Create one now
          </Link>
        </p>
      </form>
    </div>
  );
}
