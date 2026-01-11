import React from "react";
import "./UserAvatar.css";

/**
 * User Avatar Component
 * Modern avatar with speaking animations and wave effects
 * @param {string} name - User's name
 * @param {boolean} isSpeaking - Whether the user is currently speaking
 * @param {string} size - Size of the avatar ('small', 'medium', 'large')
 */
const UserAvatar = ({ name = "User", isSpeaking = false, size = "large" }) => {
  const getInitial = (name) => {
    if (!name || name.trim().length === 0) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const getColorFromInitial = (initial) => {
    const colors = [
      { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", text: "#fff" },
      { bg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", text: "#fff" },
    ];
    
    const index = initial.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initial = getInitial(name);
  const colors = getColorFromInitial(initial);
  const sizeClass = `user-avatar-${size}`;
  const stateClass = isSpeaking ? "speaking" : "idle";

  return (
    <div className={`user-avatar-container ${sizeClass} ${stateClass}`}>
      {/* Audio wave bars around avatar */}
      <div className="user-audio-waves">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="wave-bar" />
        ))}
      </div>

      <div
        className="user-avatar-circle"
        style={{
          background: colors.bg,
          color: colors.text,
        }}
      >
        <span className="user-avatar-initial">{initial}</span>
        
        {/* Pulse rings when speaking */}
        {isSpeaking && (
          <>
            <div className="user-avatar-pulse" />
            <div className="user-avatar-pulse user-avatar-pulse-secondary" />
            <div className="user-avatar-pulse user-avatar-pulse-tertiary" />
          </>
        )}
      </div>

      {/* Speaking indicator dots */}
      {isSpeaking && (
        <div className="user-avatar-speaking-indicator">
          <div className="speaking-dot dot1" />
          <div className="speaking-dot dot2" />
          <div className="speaking-dot dot3" />
        </div>
      )}
      
      {/* Name label */}
      <div className="user-avatar-label">
        <span>{name || "User"}</span>
      </div>
    </div>
  );
};

export default UserAvatar;
