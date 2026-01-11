/**
 * DifficultyTracker Component
 * Visual component showing current difficulty level and progression
 * @module components/DifficultyTracker
 */

import React from "react";
import { Tag, Timeline, Typography, Space, Tooltip } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * DifficultyTracker component
 * @param {object} props - Component props
 * @param {string} props.currentDifficulty - Current difficulty level
 * @param {Array} props.progression - Array of difficulty changes with timestamps
 * @param {boolean} props.showProgression - Whether to show progression timeline
 */
const DifficultyTracker = ({ currentDifficulty, progression = [], showProgression = false }) => {
  // Difficulty configuration
  const difficultyConfig = {
    beginner: {
      label: "Beginner",
      color: "blue",
      icon: <ArrowDownOutlined />,
    },
    intermediate: {
      label: "Intermediate",
      color: "orange",
      icon: <MinusOutlined />,
    },
    advanced: {
      label: "Advanced",
      color: "red",
      icon: <ArrowUpOutlined />,
    },
  };

  const current = difficultyConfig[currentDifficulty] || difficultyConfig.intermediate;

  // Format progression for timeline
  const timelineItems = progression.map((item, index) => {
    const prevDifficulty = index > 0 ? progression[index - 1].difficulty : null;
    const config = difficultyConfig[item.difficulty] || difficultyConfig.intermediate;
    const prevConfig = prevDifficulty ? difficultyConfig[prevDifficulty] : null;

    let changeIcon = null;
    if (prevConfig) {
      const difficultyOrder = ["beginner", "intermediate", "advanced"];
      const prevIndex = difficultyOrder.indexOf(prevDifficulty);
      const currentIndex = difficultyOrder.indexOf(item.difficulty);

      if (currentIndex > prevIndex) {
        changeIcon = <ArrowUpOutlined style={{ color: "#52c41a" }} />;
      } else if (currentIndex < prevIndex) {
        changeIcon = <ArrowDownOutlined style={{ color: "#ff4d4f" }} />;
      } else {
        changeIcon = <MinusOutlined style={{ color: "#faad14" }} />;
      }
    }

    return {
      color: config.color,
      children: (
        <Space>
          {changeIcon}
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>
        </Space>
      ),
    };
  });

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      {/* Current Difficulty */}
      <Space>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          Current Difficulty:
        </Text>
        <Tooltip title={`Interview difficulty: ${current.label}`}>
          <Tag color={current.color} icon={current.icon} style={{ fontSize: "13px", padding: "4px 12px" }}>
            {current.label}
          </Tag>
        </Tooltip>
      </Space>

      {/* Progression Timeline */}
      {showProgression && progression.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <Text type="secondary" style={{ fontSize: "12px", marginBottom: "8px", display: "block" }}>
            Difficulty Progression:
          </Text>
          <Timeline size="small" items={timelineItems} />
        </div>
      )}
    </Space>
  );
};

export default DifficultyTracker;











