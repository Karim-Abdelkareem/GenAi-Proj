import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Input,
  Select,
  Spin,
  Alert,
  Tabs,
  List,
  Tag,
  Progress,
  Divider,
  Collapse,
  Empty,
} from "antd";
import {
  FileSearchOutlined,
  BulbOutlined,
  ToolOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BookOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { App } from "antd";
import {
  getCVInsights,
  analyzeSkillsGap,
  getResumeSuggestions,
} from "../api/cvAnalysis";
import useAuthStore from "../store/authStore";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

export default function CVAnalysis() {
  const { message } = App.useApp();
  const { documentData } = useAuthStore();
  const [targetRole, setTargetRole] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");

  const hasDocument = Boolean(
    documentData && (documentData.fileName || documentData.fileType)
  );

  // CV Insights Query
  const {
    data: insights,
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["cv-insights"],
    queryFn: getCVInsights,
    enabled: hasDocument,
    retry: 1,
    onError: (error) => {
      message.error(error.message || "Failed to load CV insights");
    },
  });

  // Skills Gap Mutation
  const skillsGapMutation = useMutation({
    mutationFn: (role) => analyzeSkillsGap(role),
    onSuccess: () => {
      message.success("Skills gap analysis completed!");
    },
    onError: (error) => {
      message.error(error.message || "Failed to analyze skills gap");
    },
  });

  // Resume Suggestions Mutation
  const resumeSuggestionsMutation = useMutation({
    mutationFn: (section) => getResumeSuggestions(section),
    onSuccess: () => {
      message.success("Resume suggestions generated!");
    },
    onError: (error) => {
      message.error(error.message || "Failed to get resume suggestions");
    },
  });

  const handleSkillsGapAnalysis = () => {
    if (!targetRole.trim()) {
      message.warning("Please enter a target role");
      return;
    }
    skillsGapMutation.mutate(targetRole);
  };

  const handleGetSuggestions = () => {
    resumeSuggestionsMutation.mutate(selectedSection);
  };

  if (!hasDocument) {
    return (
      <div style={{ padding: "40px" }}>
        <Empty
          description={
            <span style={{ color: "#a1a1aa" }}>
              Please upload your CV first to use CV analysis features
            </span>
          }
        >
          <Button type="primary" href="/profile">
            Upload CV
          </Button>
        </Empty>
      </div>
    );
  }

  const tabItems = [
    {
      key: "insights",
      label: (
        <span>
          <BulbOutlined /> CV Insights
        </span>
      ),
      children: (
        <CVInsightsTab
          insights={insights}
          isLoading={isLoadingInsights}
          onRefresh={refetchInsights}
        />
      ),
    },
    {
      key: "skills-gap",
      label: (
        <span>
          <FileSearchOutlined /> Skills Gap Analysis
        </span>
      ),
      children: (
        <SkillsGapTab
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          mutation={skillsGapMutation}
          onAnalyze={handleSkillsGapAnalysis}
        />
      ),
    },
    {
      key: "suggestions",
      label: (
        <span>
          <ToolOutlined /> Resume Suggestions
        </span>
      ),
      children: (
        <ResumeSuggestionsTab
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          mutation={resumeSuggestionsMutation}
          onGetSuggestions={handleGetSuggestions}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title level={2} style={{ margin: 0 }}>
              CV Analysis Dashboard
            </Title>
            <Text type="secondary">
              Get AI-powered insights, skills gap analysis, and resume
              improvement suggestions
            </Text>
          </Space>
        </Card>

        <Card>
          <Tabs defaultActiveKey="insights" items={tabItems} />
        </Card>
      </Space>
    </div>
  );
}

// CV Insights Tab Component
function CVInsightsTab({ insights, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text type="secondary">Analyzing your CV...</Text>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Empty
        description="Click refresh to generate CV insights"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
        >
          Generate Insights
        </Button>
      </Empty>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={4} style={{ margin: 0 }}>
          CV Analysis Results
        </Title>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {/* Overall Score */}
      {insights.overallScore !== undefined && (
        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Text strong>Overall CV Score</Text>
            <Progress
              percent={insights.overallScore}
              status={
                insights.overallScore >= 80
                  ? "success"
                  : insights.overallScore >= 60
                  ? "active"
                  : "exception"
              }
              format={(percent) => `${percent}/100`}
            />
          </Space>
        </Card>
      )}

      {/* Summary */}
      {insights.summary && (
        <Card>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text strong>Summary</Text>
            <Paragraph style={{ margin: 0, color: "#a1a1aa" }}>
              {insights.summary}
            </Paragraph>
          </Space>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {/* Strengths */}
        {insights.strengths && insights.strengths.length > 0 && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <span>Strengths</span>
                </Space>
              }
            >
              <List
                dataSource={insights.strengths}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Tag color="green">{index + 1}</Tag>
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        )}

        {/* Weaknesses */}
        {insights.weaknesses && insights.weaknesses.length > 0 && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                  <span>Areas to Improve</span>
                </Space>
              }
            >
              <List
                dataSource={insights.weaknesses}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Tag color="red">{index + 1}</Tag>
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Skills Summary */}
      {insights.skillsSummary && (
        <Card title="Skills Summary">
          <Row gutter={[16, 16]}>
            {insights.skillsSummary.technical &&
              insights.skillsSummary.technical.length > 0 && (
                <Col xs={24} md={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Technical Skills</Text>
                    <Space wrap>
                      {insights.skillsSummary.technical.map((skill, i) => (
                        <Tag key={i} color="blue">
                          {skill}
                        </Tag>
                      ))}
                    </Space>
                  </Space>
                </Col>
              )}
            {insights.skillsSummary.soft &&
              insights.skillsSummary.soft.length > 0 && (
                <Col xs={24} md={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Soft Skills</Text>
                    <Space wrap>
                      {insights.skillsSummary.soft.map((skill, i) => (
                        <Tag key={i} color="purple">
                          {skill}
                        </Tag>
                      ))}
                    </Space>
                  </Space>
                </Col>
              )}
            {insights.skillsSummary.missing &&
              insights.skillsSummary.missing.length > 0 && (
                <Col xs={24} md={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Missing Skills</Text>
                    <Space wrap>
                      {insights.skillsSummary.missing.map((skill, i) => (
                        <Tag key={i} color="orange">
                          {skill}
                        </Tag>
                      ))}
                    </Space>
                  </Space>
                </Col>
              )}
          </Row>
        </Card>
      )}

      {/* Experience Highlights */}
      {insights.experienceHighlights &&
        insights.experienceHighlights.length > 0 && (
          <Card title="Experience Highlights">
            <List
              dataSource={insights.experienceHighlights}
              renderItem={(item, index) => (
                <List.Item>
                  <Space>
                    <Tag color="cyan">{index + 1}</Tag>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card
          title={
            <Space>
              <RocketOutlined style={{ color: "#1890ff" }} />
              <span>Recommendations</span>
            </Space>
          }
        >
          <List
            dataSource={insights.recommendations}
            renderItem={(item, index) => (
              <List.Item>
                <Space>
                  <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  <Text>{item}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}
    </Space>
  );
}

// Skills Gap Tab Component
function SkillsGapTab({
  targetRole,
  setTargetRole,
  mutation,
  onAnalyze,
}) {
  const { data: analysis, isLoading } = mutation;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Enter Target Role</Text>
            <Text type="secondary" style={{ display: "block", marginTop: "4px" }}>
              Compare your skills with a specific job role
            </Text>
          </div>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="e.g., Senior Full Stack Developer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onPressEnter={onAnalyze}
              size="large"
            />
            <Button
              type="primary"
              size="large"
              loading={isLoading}
              onClick={onAnalyze}
            >
              Analyze
            </Button>
          </Space.Compact>
        </Space>
      </Card>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">Analyzing skills gap...</Text>
          </div>
        </div>
      )}

      {analysis && (
        <>
          {/* Match Score */}
          {analysis.matchScore !== undefined && (
            <Card>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Text strong>Match Score</Text>
                <Progress
                  percent={analysis.matchScore}
                  status={
                    analysis.matchScore >= 80
                      ? "success"
                      : analysis.matchScore >= 60
                      ? "active"
                      : "exception"
                  }
                  format={(percent) => `${percent}%`}
                />
              </Space>
            </Card>
          )}

          {/* Summary */}
          {analysis.summary && (
            <Card>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text strong>Summary</Text>
                <Paragraph style={{ margin: 0, color: "#a1a1aa" }}>
                  {analysis.summary}
                </Paragraph>
              </Space>
            </Card>
          )}

          <Row gutter={[16, 16]}>
            {/* Matching Skills */}
            {analysis.matchingSkills && analysis.matchingSkills.length > 0 && (
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <span>Matching Skills</span>
                    </Space>
                  }
                >
                  <List
                    dataSource={analysis.matchingSkills}
                    renderItem={(item) => (
                      <List.Item>
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          <Space>
                            <Tag
                              color={
                                item.proficiency === "high"
                                  ? "green"
                                  : item.proficiency === "medium"
                                  ? "blue"
                                  : "orange"
                              }
                            >
                              {item.skill}
                            </Tag>
                            <Text type="secondary">({item.proficiency})</Text>
                          </Space>
                          {item.evidence && (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {item.evidence}
                            </Text>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            )}

            {/* Missing Skills */}
            {analysis.missingSkills && analysis.missingSkills.length > 0 && (
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <WarningOutlined style={{ color: "#ff9800" }} />
                      <span>Missing Skills</span>
                    </Space>
                  }
                >
                  <List
                    dataSource={analysis.missingSkills}
                    renderItem={(item) => (
                      <List.Item>
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          <Space>
                            <Tag
                              color={
                                item.importance === "critical"
                                  ? "red"
                                  : item.importance === "high"
                                  ? "orange"
                                  : "default"
                              }
                            >
                              {item.skill}
                            </Tag>
                            <Text type="secondary">({item.importance})</Text>
                          </Space>
                          {item.description && (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {item.description}
                            </Text>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            )}
          </Row>

          {/* Learning Path */}
          {analysis.learningPath && analysis.learningPath.length > 0 && (
            <Card
              title={
                <Space>
                  <BookOutlined style={{ color: "#1890ff" }} />
                  <span>Learning Path</span>
                </Space>
              }
            >
              <List
                dataSource={analysis.learningPath.sort((a, b) => a.priority - b.priority)}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <Space>
                        <Tag color="blue">Priority {item.priority}</Tag>
                        <Text strong>{item.skill}</Text>
                        {item.estimatedTime && (
                          <Text type="secondary">({item.estimatedTime})</Text>
                        )}
                      </Space>
                      {item.resources && item.resources.length > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Resources: {item.resources.join(", ")}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </>
      )}
    </Space>
  );
}

// Resume Suggestions Tab Component
function ResumeSuggestionsTab({
  selectedSection,
  setSelectedSection,
  mutation,
  onGetSuggestions,
}) {
  const { data: suggestions, isLoading } = mutation;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Select Section to Analyze</Text>
            <Text type="secondary" style={{ display: "block", marginTop: "4px" }}>
              Get specific suggestions for improving your CV sections
            </Text>
          </div>
          <Space.Compact style={{ width: "100%" }}>
            <Select
              value={selectedSection}
              onChange={setSelectedSection}
              size="large"
              style={{ width: "70%" }}
            >
              <Option value="all">All Sections</Option>
              <Option value="summary">Professional Summary</Option>
              <Option value="experience">Work Experience</Option>
              <Option value="skills">Skills Section</Option>
              <Option value="education">Education Section</Option>
            </Select>
            <Button
              type="primary"
              size="large"
              loading={isLoading}
              onClick={onGetSuggestions}
              style={{ width: "30%" }}
            >
              Get Suggestions
            </Button>
          </Space.Compact>
        </Space>
      </Card>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">Generating suggestions...</Text>
          </div>
        </div>
      )}

      {suggestions && (
        <>
          {/* Current State */}
          {suggestions.currentState && (
            <Card>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text strong>Current State</Text>
                <Paragraph style={{ margin: 0, color: "#a1a1aa" }}>
                  {suggestions.currentState}
                </Paragraph>
              </Space>
            </Card>
          )}

          {/* Suggestions */}
          {suggestions.suggestions && suggestions.suggestions.length > 0 && (
            <Card title="Improvement Suggestions">
              <Collapse>
                {suggestions.suggestions.map((suggestion, index) => (
                  <Panel
                    header={
                      <Space>
                        <Tag
                          color={
                            suggestion.priority === "high"
                              ? "red"
                              : suggestion.priority === "medium"
                              ? "orange"
                              : "blue"
                          }
                        >
                          {suggestion.priority}
                        </Tag>
                        <Text>{suggestion.issue}</Text>
                      </Space>
                    }
                    key={index}
                  >
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <div>
                        <Text strong>Suggestion:</Text>
                        <Paragraph style={{ margin: "8px 0", color: "#a1a1aa" }}>
                          {suggestion.suggestion}
                        </Paragraph>
                      </div>
                      {suggestion.example && (
                        <div>
                          <Text strong>Example:</Text>
                          <Paragraph
                            style={{
                              margin: "8px 0",
                              color: "#a1a1aa",
                              fontStyle: "italic",
                            }}
                          >
                            {suggestion.example}
                          </Paragraph>
                        </div>
                      )}
                    </Space>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          )}

          {/* Best Practices */}
          {suggestions.bestPractices && suggestions.bestPractices.length > 0 && (
            <Card title="Best Practices">
              <List
                dataSource={suggestions.bestPractices}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Tag color="green">{index + 1}</Tag>
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Before/After */}
          {suggestions.beforeAfter && (
            <Card title="Before & After Example">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Before">
                    <Paragraph style={{ margin: 0, color: "#a1a1aa" }}>
                      {suggestions.beforeAfter.before}
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="After">
                    <Paragraph style={{ margin: 0, color: "#a1a1aa" }}>
                      {suggestions.beforeAfter.after}
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            </Card>
          )}

          {/* Summary */}
          {suggestions.summary && (
            <Card>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text strong>Summary & Next Steps</Text>
                <Paragraph style={{ margin: 0, color: "#a1a1aa" }}>
                  {suggestions.summary}
                </Paragraph>
              </Space>
            </Card>
          )}
        </>
      )}
    </Space>
  );
}

