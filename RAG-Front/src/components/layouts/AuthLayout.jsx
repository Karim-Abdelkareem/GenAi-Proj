import React from "react";
import { App, ConfigProvider, theme } from "antd";

export default function AuthLayout({ children }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#0ea5e9",
          colorBgBase: "#09090b",
          colorTextBase: "#fafafa",
          borderRadius: 12,
        },
      }}
    >
      <App>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            position: "relative",
            overflow: "hidden",
            background: `
              radial-gradient(ellipse at top left, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
              linear-gradient(180deg, #09090b 0%, #18181b 100%)
            `,
          }}
        >
          {/* Animated background orbs */}
          <div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)",
              top: "-200px",
              left: "-200px",
              filter: "blur(80px)",
              opacity: 0.6,
              animation: "float-orb 20s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
              bottom: "-150px",
              right: "-150px",
              filter: "blur(80px)",
              opacity: 0.6,
              animation: "float-orb 25s ease-in-out infinite reverse",
              pointerEvents: "none",
            }}
          />

          {/* Geometric decorations */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "15%",
              width: "120px",
              height: "120px",
              border: "1px solid rgba(14, 165, 233, 0.2)",
              transform: "rotate(45deg)",
              borderRadius: "16px",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "15%",
              left: "10%",
              width: "80px",
              height: "80px",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              transform: "rotate(12deg)",
              borderRadius: "12px",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "5%",
              width: "60px",
              height: "60px",
              background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              maxWidth: "440px",
              width: "100%",
              zIndex: 10,
            }}
          >
            {children}
          </div>

          {/* Keyframe animations */}
          <style>{`
            @keyframes float-orb {
              0%, 100% {
                transform: translate(0, 0) scale(1);
              }
              25% {
                transform: translate(50px, -30px) scale(1.1);
              }
              50% {
                transform: translate(20px, 40px) scale(0.95);
              }
              75% {
                transform: translate(-30px, 20px) scale(1.05);
              }
            }
          `}</style>
        </div>
      </App>
    </ConfigProvider>
  );
}
