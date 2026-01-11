import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => registerUser(name, email, password),
    onSuccess: () => {
      navigate("/login");
    },
    onError: (error) => {
      setError(error.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    registerMutation.mutate();
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 16px 16px 48px",
    background: "rgba(9, 9, 11, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    color: "#fafafa",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
  };

  const iconStyle = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#71717a",
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
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(245, 158, 11, 0.4)",
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
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
          Join Us Today
        </h2>
        <p style={{ margin: 0, color: "#71717a", fontSize: "15px" }}>
          Create your account and get started
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
          {/* Name Input */}
          <div style={{ position: "relative" }}>
            <div style={iconStyle}>
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(245, 158, 11, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Email Input */}
          <div style={{ position: "relative" }}>
            <div style={iconStyle}>
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
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(245, 158, 11, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: "relative" }}>
            <div style={iconStyle}>
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(245, 158, 11, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.15)";
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
          disabled={registerMutation.isPending}
          style={{
            width: "100%",
            padding: "16px",
            marginTop: "28px",
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            border: "none",
            borderRadius: "14px",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            cursor: registerMutation.isPending ? "not-allowed" : "pointer",
            opacity: registerMutation.isPending ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!registerMutation.isPending) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(245, 158, 11, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(245, 158, 11, 0.4)";
          }}
        >
          {registerMutation.isPending ? (
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
              Creating account...
            </>
          ) : (
            <>
              Create account
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

        {/* Sign in link */}
        <p style={{ textAlign: "center", marginTop: "24px", color: "#71717a", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#fbbf24",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fcd34d")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#fbbf24")}
          >
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}
