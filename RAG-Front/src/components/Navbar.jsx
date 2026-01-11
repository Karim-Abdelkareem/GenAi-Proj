import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown, Avatar } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  VideoCameraOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  const navItems = [
    { key: "/home", icon: <HomeOutlined />, label: "Home" },
    { key: "/profile", icon: <UserOutlined />, label: "Profile" },
    {
      key: "/cv-analysis",
      icon: <FileSearchOutlined />,
      label: "CV Analysis",
    },
    {
      key: "/interview-prep",
      icon: <QuestionCircleOutlined />,
      label: "Preparation",
    },
    {
      key: "/interview-session",
      icon: <VideoCameraOutlined />,
      label: "Interview",
    },
  ];

  const userMenuItems = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: 600, color: "#fafafa" }}>
            {user?.name || "User"}
          </div>
          <div style={{ fontSize: "12px", color: "#71717a" }}>
            {user?.email}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ef4444" }} />,
      label: <span style={{ color: "#ef4444" }}>Logout</span>,
      onClick: handleLogout,
    },
  ];

  const getInitial = (name) => {
    if (!name || name.trim().length === 0) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        padding: "0 24px",
        background: "rgba(9, 9, 11, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}
      >
        <div
          onClick={() => navigate("/home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 15px rgba(14, 165, 233, 0.35)",
            }}
          >
            🎯
          </div>
          <span
            style={{
              fontSize: "18px",
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

        {/* Navigation Links */}
        {user && (
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    background: isActive
                      ? "rgba(14, 165, 233, 0.15)"
                      : "transparent",
                    border: "1px solid",
                    borderColor: isActive
                      ? "rgba(14, 165, 233, 0.3)"
                      : "transparent",
                    borderRadius: "10px",
                    color: isActive ? "#38bdf8" : "#a1a1aa",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#a1a1aa";
                    }
                  }}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* User Menu */}
      {user && (
        <Dropdown
          menu={{
            items: userMenuItems,
            style: {
              background: "rgba(39, 39, 42, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "8px",
              minWidth: "200px",
            },
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(255, 255, 255, 0.03)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <Avatar
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "#fff",
                fontWeight: 600,
                boxShadow: "0 2px 10px rgba(14, 165, 233, 0.35)",
              }}
              size={32}
            >
              {getInitial(user?.name || user?.email)}
            </Avatar>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#fafafa",
                  lineHeight: 1.2,
                }}
              >
                {user.name || user.email?.split("@")[0]}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#71717a",
                  lineHeight: 1.2,
                }}
              >
                Online
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </Dropdown>
      )}
    </header>
  );
}
