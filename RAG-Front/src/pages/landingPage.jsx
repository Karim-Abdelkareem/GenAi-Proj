import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RocketOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: "28px", color: "#fff" }} />,
      title: "Resume Analysis",
      description: "Get detailed insights into your resume with AI-powered analysis",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      glow: "rgba(14, 165, 233, 0.3)",
    },
    {
      icon: <BarChartOutlined style={{ fontSize: "28px", color: "#fff" }} />,
      title: "ATS Scoring",
      description: "Receive instant ATS compatibility scores and improvement suggestions",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      glow: "rgba(245, 158, 11, 0.3)",
    },
    {
      icon: <RocketOutlined style={{ fontSize: "28px", color: "#fff" }} />,
      title: "Job Matching",
      description: "Find opportunities that match your skills and career goals",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      glow: "rgba(16, 185, 129, 0.3)",
    },
    {
      icon: <UserOutlined style={{ fontSize: "28px", color: "#fff" }} />,
      title: "AI Interview",
      description: "Practice with our AI interviewer and get real-time feedback",
      gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
      glow: "rgba(244, 63, 94, 0.3)",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse at top left, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #09090b 0%, #18181b 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
          top: "-300px",
          left: "-300px",
          filter: "blur(100px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          bottom: "-200px",
          right: "-200px",
          filter: "blur(100px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 48px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
            }}
          >
            🎯
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TalentMatch
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "10px",
              color: "#fafafa",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(14, 165, 233, 0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 30px rgba(14, 165, 233, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(14, 165, 233, 0.35)";
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left side - Text */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "rgba(14, 165, 233, 0.1)",
              border: "1px solid rgba(14, 165, 233, 0.25)",
              borderRadius: "24px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "14px" }}>✨</span>
            <span style={{ color: "#38bdf8", fontSize: "13px", fontWeight: 500 }}>
              AI-Powered Career Platform
            </span>
          </div>

          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.1,
              margin: "0 0 24px 0",
              background: "linear-gradient(135deg, #fafafa 0%, #d4d4d8 50%, #a1a1aa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Launch Your <br />
            Dream Career
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#a1a1aa",
              margin: "0 0 40px 0",
              maxWidth: "480px",
            }}
          >
            Upload your resume, get instant ATS scoring, and discover personalized
            job recommendations. Practice interviews with our AI and land your
            dream job.
          </p>

          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => navigate("/register")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 32px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                border: "none",
                borderRadius: "14px",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 30px rgba(14, 165, 233, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(14, 165, 233, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 30px rgba(14, 165, 233, 0.4)";
              }}
            >
              Start Free <ArrowRightOutlined />
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "16px 32px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                color: "#fafafa",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right side - Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: "rgba(39, 39, 42, 0.5)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "28px",
                transition: "all 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: feature.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  boxShadow: `0 8px 24px ${feature.glow}`,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#fafafa",
                  margin: "0 0 10px 0",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "#71717a",
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
