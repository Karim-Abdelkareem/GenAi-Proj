import React from "react";
import "./AudioVisualization.css";

/**
 * Audio Visualization Component
 * Modern AI avatar with animated audio waves and orbital effects
 * @param {boolean} isPlaying - Whether audio is currently playing
 * @param {number} barCount - Number of bars to display (default: 12)
 * @param {string} height - Height of the visualization container
 */
const AudioVisualization = ({
  isPlaying = false,
  barCount = 12,
  height = "280px",
}) => {
  return (
    <div className="audio-visualization-container" style={{ height }}>
      {/* AI Avatar with orbital rings */}
      <div className="ai-avatar-wrapper">
        <div className={`ai-avatar-circle ${isPlaying ? "playing" : "idle"}`}>
          {/* Orbital rings */}
          <div className="ai-orbital-ring" />
          <div className="ai-orbital-ring" />
          <div className="ai-orbital-ring" />

          {/* Pulse rings */}
          <div className="ai-pulse-ring" />
          <div className="ai-pulse-ring" />
          <div className="ai-pulse-ring" />

          {/* AI Icon */}
          <span className="ai-avatar-icon">🤖</span>
        </div>
      </div>

      {/* Audio Bars */}
      <div className="audio-bars-wrapper">
        {Array.from({ length: barCount }).map((_, index) => (
          <div
            key={index}
            className={`audio-bar ${isPlaying ? "playing" : "idle"}`}
          />
        ))}
      </div>

      {/* Status Label */}
      <div className="audio-visualization-label">
        <span>{isPlaying ? "AI Speaking" : "AI Ready"}</span>
      </div>
    </div>
  );
};

export default AudioVisualization;
