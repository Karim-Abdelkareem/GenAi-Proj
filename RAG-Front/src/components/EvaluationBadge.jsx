/**
 * EvaluationBadge Component
 * Displays inline evaluation results with score, feedback, and category breakdown
 * @module components/EvaluationBadge
 */

import React, { useState } from "react";
import { Badge, Tag, Tooltip, Collapse, Progress, Typography, Space } from "antd";
import { TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * EvaluationBadge component
 * @param {object} props - Component props
 * @param {number} props.score - Score from 0-100
 * @param {object} props.evaluation - Evaluation object with categories and feedback
 * @param {string} props.difficulty - Current difficulty level
 * @param {boolean} props.compact - Whether to show compact view
 */
const EvaluationBadge = ({ score, evaluation, difficulty, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!score && score !== 0) {
    return null;
  }

  // Determine score color and status
  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircleOutlined />;
    if (score >= 50) return <InfoCircleOutlined />;
    return <CloseCircleOutlined />;
  };

  const scoreColor = getScoreColor(score);
  const scoreIcon = getScoreIcon(score);

  // Category breakdown
  const categories = evaluation?.categories || {};
  const categoryLabels = {
    technical: "Technical",
    completeness: "Completeness",
    communication: "Communication",
    relevance: "Relevance",
  };

  const categoryMaxScores = {
    technical: 40,
    completeness: 30,
    communication: 20,
    relevance: 10,
  };

  // Difficulty color mapping
  const difficultyColors = {
    beginner: "blue",
    intermediate: "orange",
    advanced: "red",
  };

  if (compact) {
    return (
      <Tooltip
        title={
          <div>
            <div>Score: {score}/100</div>
            {evaluation?.feedback && <div>{evaluation.feedback}</div>}
            {difficulty && <div>Difficulty: {difficulty}</div>}
          </div>
        }
      >
        <Badge
          count={
            <Tag color={scoreColor} icon={scoreIcon} style={{ margin: 0 }}>
              {score}
            </Tag>
          }
        >
          <span />
        </Badge>
      </Tooltip>
    );
  }

  return (
    <div style={{ marginTop: "8px" }}>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        {/* Score Badge */}
        <Space>
          <Tag color={scoreColor} icon={scoreIcon} style={{ fontSize: "14px", padding: "4px 12px" }}>
            <TrophyOutlined style={{ marginRight: "4px" }} />
            Score: {score}/100
          </Tag>
          {difficulty && (
            <Tag color={difficultyColors[difficulty] || "default"}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Tag>
          )}
        </Space>

        {/* Category Breakdown */}
        {Object.keys(categories).length > 0 && (
          <Collapse
            ghost
            size="small"
            items={[
              {
                key: "breakdown",
                label: <Text type="secondary">View Category Breakdown</Text>,
                children: (
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {Object.entries(categories).map(([key, value]) => (
                      <div key={key}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Text style={{ fontSize: "12px" }}>{categoryLabels[key] || key}:</Text>
                          <Text strong>{value}/{categoryMaxScores[key] || 100}</Text>
                        </Space>
                        <Progress
                          percent={(value / (categoryMaxScores[key] || 100)) * 100}
                          size="small"
                          strokeColor={
                            value >= (categoryMaxScores[key] || 100) * 0.8
                              ? "#52c41a"
                              : value >= (categoryMaxScores[key] || 100) * 0.5
                              ? "#faad14"
                              : "#ff4d4f"
                          }
                          showInfo={false}
                        />
                      </div>
                    ))}
                  </Space>
                ),
              },
            ]}
          />
        )}

        {/* Feedback */}
        {evaluation?.feedback && (
          <div style={{ marginTop: "8px" }}>
            <Text strong style={{ fontSize: "12px" }}>
              Feedback:
            </Text>
            <Paragraph style={{ margin: "4px 0 0 0", fontSize: "12px" }}>{evaluation.feedback}</Paragraph>
          </div>
        )}
      </Space>
    </div>
  );
};

export default EvaluationBadge;











