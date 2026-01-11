/**
 * InterviewReport Component
 * Comprehensive report display showing scores, Q/A pairs, difficulty progression, and recommendations
 * @module components/InterviewReport
 */

import React from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Progress,
  Divider,
  List,
  Row,
  Col,
  Statistic,
  Collapse,
  Alert,
} from "antd";
import {
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * InterviewReport component
 * @param {object} props - Component props
 * @param {object} props.report - Report object from backend
 * @param {string} props.sessionId - Session ID for fetching if needed
 * @param {Function} props.onClose - Callback for modal close (optional)
 */
const InterviewReport = ({ report, sessionId, onClose }) => {
  if (!report) {
    return (
      <Alert
        message="No Report Available"
        description="The interview report is not available yet. Please try again later."
        type="warning"
        showIcon
      />
    );
  }

  const {
    overallScore = 0,
    scoreBreakdown = {},
    questions = [],
    difficultyProgression = [],
    strengths = [],
    weaknesses = [],
    recommendations = [],
    technicalSkills = {},
  } = report;

  // Calculate score color
  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 50) return "#faad14";
    return "#ff4d4f";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Overall Score Section */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={3}>
            <TrophyOutlined style={{ marginRight: "8px", color: getScoreColor(overallScore) }} />
            Overall Interview Score
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Overall Score"
                value={overallScore}
                suffix="/ 100"
                valueStyle={{ color: getScoreColor(overallScore), fontSize: "32px" }}
                prefix={<TrophyOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={16}>
              <Progress
                percent={overallScore}
                strokeColor={getScoreColor(overallScore)}
                status={overallScore >= 80 ? "success" : overallScore >= 50 ? "active" : "exception"}
                format={(percent) => `${percent}%`}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Score Breakdown */}
      {Object.keys(scoreBreakdown).length > 0 && (
        <Card title="Score Breakdown by Category">
          <Row gutter={[16, 16]}>
            {Object.entries(scoreBreakdown).map(([category, score]) => {
              const categoryLabels = {
                technical: "Technical Accuracy",
                completeness: "Completeness",
                communication: "Communication",
                relevance: "Relevance",
              };
              const maxScores = {
                technical: 40,
                completeness: 30,
                communication: 20,
                relevance: 10,
              };
              const maxScore = maxScores[category] || 100;
              const percentage = (score / maxScore) * 100;

              return (
                <Col xs={24} sm={12} key={category}>
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Text strong>{categoryLabels[category] || category}:</Text>
                      <Text strong style={{ color: getScoreColor(percentage) }}>
                        {score}/{maxScore}
                      </Text>
                    </Space>
                    <Progress
                      percent={percentage}
                      strokeColor={getScoreColor(percentage)}
                      showInfo={false}
                    />
                  </Space>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Questions and Answers */}
      {questions && questions.length > 0 && (
        <Card title={`Questions & Answers (${questions.length})`}>
          <Collapse
            items={questions.map((qa, index) => ({
              key: index,
              label: (
                <Space>
                  <Text strong>Question {index + 1}</Text>
                  {qa.score !== undefined && (
                    <Tag color={getScoreColor(qa.score)} icon={<TrophyOutlined />}>
                      Score: {qa.score}/100
                    </Tag>
                  )}
                  {qa.evaluation?.difficulty && (
                    <Tag>{qa.evaluation.difficulty.charAt(0).toUpperCase() + qa.evaluation.difficulty.slice(1)}</Tag>
                  )}
                </Space>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Question:</Text>
                    <Paragraph style={{ marginTop: "8px" }}>{qa.question}</Paragraph>
                  </div>
                  <div>
                    <Text strong>Your Answer:</Text>
                    <Paragraph style={{ marginTop: "8px" }}>{qa.answer}</Paragraph>
                  </div>
                  {qa.evaluation && (
                    <div>
                      <Text strong>Evaluation:</Text>
                      {qa.evaluation.feedback && (
                        <Paragraph style={{ marginTop: "8px" }}>{qa.evaluation.feedback}</Paragraph>
                      )}
                      {qa.evaluation.categories && (
                        <Space direction="vertical" size="small" style={{ marginTop: "8px", width: "100%" }}>
                          {Object.entries(qa.evaluation.categories).map(([key, value]) => (
                            <Space key={key} style={{ width: "100%", justifyContent: "space-between" }}>
                              <Text style={{ fontSize: "12px" }}>{key}:</Text>
                              <Text>{value}</Text>
                            </Space>
                          ))}
                        </Space>
                      )}
                    </div>
                  )}
                  {qa.timestamp && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {formatDate(qa.timestamp)}
                    </Text>
                  )}
                </Space>
              ),
            }))}
          />
        </Card>
      )}

      {/* Difficulty Progression */}
      {difficultyProgression && difficultyProgression.length > 0 && (
        <Card title="Difficulty Progression">
          <List
            dataSource={difficultyProgression}
            renderItem={(item, index) => (
              <List.Item>
                <Space>
                  <Text strong>#{index + 1}</Text>
                  <Tag color={item.difficulty === "advanced" ? "red" : item.difficulty === "intermediate" ? "orange" : "blue"}>
                    {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                  </Tag>
                  {item.timestamp && <Text type="secondary">{formatDate(item.timestamp)}</Text>}
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <Card
          title={
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <span>Strengths</span>
            </Space>
          }
        >
          <List
            dataSource={strengths}
            renderItem={(strength) => (
              <List.Item>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>{strength}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Weaknesses */}
      {weaknesses && weaknesses.length > 0 && (
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: "#ff4d4f" }} />
              <span>Areas for Improvement</span>
            </Space>
          }
        >
          <List
            dataSource={weaknesses}
            renderItem={(weakness) => (
              <List.Item>
                <Space>
                  <WarningOutlined style={{ color: "#ff4d4f" }} />
                  <Text>{weakness}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card
          title={
            <Space>
              <BulbOutlined style={{ color: "#1890ff" }} />
              <span>Recommendations</span>
            </Space>
          }
        >
          <List
            dataSource={recommendations}
            renderItem={(recommendation) => (
              <List.Item>
                <Space>
                  <BulbOutlined style={{ color: "#1890ff" }} />
                  <Text>{recommendation}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Technical Skills Assessment */}
      {technicalSkills && Object.keys(technicalSkills).length > 0 && (
        <Card title="Technical Skills Assessment">
          <Row gutter={[16, 16]}>
            {Object.entries(technicalSkills).map(([skill, score]) => (
              <Col xs={24} sm={12} md={8} key={skill}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>{skill}:</Text>
                  <Progress
                    percent={score}
                    strokeColor={getScoreColor(score)}
                    format={(percent) => `${percent}%`}
                  />
                </Space>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </Space>
  );
};

export default InterviewReport;











