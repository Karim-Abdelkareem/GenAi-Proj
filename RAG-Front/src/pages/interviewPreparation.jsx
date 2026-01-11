import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Collapse,
  Typography,
  Space,
  Spin,
  Empty,
  Alert,
  Tag,
  Select,
  Row,
  Col,
  Button,
  Statistic,
} from "antd";
import {
  QuestionCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import useAuthStore from "../store/authStore";
import interviewService from "../services/interviewApi";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export default function InterviewPreparation() {
  const { message } = App.useApp();
  const { token, interviewQuestions, setInterviewQuestions } = useAuthStore();
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    data: questionsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["interviewQuestions"],
    queryFn: async () => {
      console.log("Fetching questions from API...");
      const result = await interviewService.getQuestions();
      console.log("Questions fetched:", result);
      return result;
    },
    enabled: false, // Don't fetch automatically
    retry: 1,
    onError: (error) => {
      console.error("Query error:", error);
    },
    onSuccess: (data) => {
      console.log("Query success:", data);
    },
  });

  // Use questions from store if available, otherwise from API response
  const allQuestions = useMemo(() => {
    if (interviewQuestions) {
      return (
        interviewQuestions?.data?.questions ||
        interviewQuestions?.questions ||
        interviewQuestions ||
        []
      );
    }
    return questionsData?.data?.questions || questionsData?.questions || [];
  }, [interviewQuestions, questionsData]);

  // Save questions to store when fetched
  useEffect(() => {
    if (questionsData && !isLoading) {
      setInterviewQuestions(questionsData);
      message.success("New interview questions generated successfully!");
    }
  }, [questionsData, isLoading, setInterviewQuestions, message]);

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching questions:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load interview questions";
      message.error(errorMessage);
    }
  }, [isError, error, message]);

  const handleGenerateNew = async () => {
    if (!token) {
      message.error("Please login to generate questions");
      return;
    }
    
    try {
      console.log("Generating new questions...");
      // Clear existing questions from store to show loading state
      setInterviewQuestions(null);
      // Trigger refetch - this will set isLoading/isFetching to true
      await refetch();
    } catch (err) {
      console.error("Error in handleGenerateNew:", err);
      message.error("Failed to generate questions. Please try again.");
    }
  };

  // Extract unique categories and difficulties
  const categories = useMemo(() => {
    const cats = new Set();
    allQuestions.forEach((q) => {
      if (q.category) cats.add(q.category);
    });
    return Array.from(cats).sort();
  }, [allQuestions]);

  const difficulties = useMemo(() => {
    const diffs = new Set();
    allQuestions.forEach((q) => {
      if (q.difficulty) diffs.add(q.difficulty);
    });
    return Array.from(diffs).sort();
  }, [allQuestions]);

  // Filter questions based on selected filters
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesDifficulty =
        !selectedDifficulty || q.difficulty === selectedDifficulty;
      const matchesCategory =
        !selectedCategory || q.category === selectedCategory;
      return matchesDifficulty && matchesCategory;
    });
  }, [allQuestions, selectedDifficulty, selectedCategory]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "green";
      case "medium":
        return "orange";
      case "hard":
        return "red";
      default:
        return "blue";
    }
  };

  const getCategoryColor = (category) => {
    const colors = [
      "blue",
      "purple",
      "cyan",
      "geekblue",
      "magenta",
      "volcano",
      "gold",
    ];
    const index = categories.indexOf(category);
    return colors[index % colors.length] || "default";
  };

  const handleClearFilters = () => {
    setSelectedDifficulty(null);
    setSelectedCategory(null);
  };

  const hasActiveFilters = selectedDifficulty || selectedCategory;

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Space direction="vertical" size="small" style={{ flex: 1 }}>
              <Title level={2} style={{ margin: 0, color: "#fafafa" }}>
                Interview Preparation
              </Title>
              <Text style={{ color: "#a1a1aa" }}>
                Practice with AI-generated interview questions and expert tips
              </Text>
              {interviewQuestions && (
                <Text
                  style={{
                    fontSize: "12px",
                    fontStyle: "italic",
                    color: "#71717a",
                  }}
                >
                  Showing saved questions. Click "Generate New Questions" to
                  refresh.
                </Text>
              )}
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleGenerateNew}
              loading={isLoading || isFetching}
              disabled={!token || isLoading || isFetching}
            >
              Generate New Questions
            </Button>
          </div>
        </Card>

        {(isLoading || isFetching) && (
          <Card>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>
                <Text style={{ color: "#a1a1aa" }}>
                  Loading interview questions...
                </Text>
              </div>
            </div>
          </Card>
        )}

        {isError && (
          <Alert
            message="Error Loading Questions"
            description={
              error?.message ||
              "Failed to load interview questions. Please try again later."
            }
            type="error"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        )}

        {!isLoading &&
          !isFetching &&
          !isError &&
          allQuestions.length === 0 &&
          !interviewQuestions && (
            <Card>
              <Empty
                description={
                  <Space direction="vertical" size="small">
                    <Text style={{ color: "#a1a1aa" }}>
                      No interview questions available at the moment
                    </Text>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleGenerateNew}
                      loading={isLoading}
                      disabled={!token}
                    >
                      Generate Questions
                    </Button>
                  </Space>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}

        {!isLoading && !isFetching && !isError && allQuestions.length > 0 && (
          <>
            {/* Filters Section */}
            <Card>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <Space size="middle" wrap>
                    <FilterOutlined
                      style={{ fontSize: "18px", color: "#0ea5e9" }}
                    />
                    <Text strong style={{ fontSize: "16px", color: "#fafafa" }}>
                      Filter Questions
                    </Text>
                  </Space>
                  {hasActiveFilters && (
                    <Button
                      icon={<ClearOutlined />}
                      onClick={handleClearFilters}
                      size="small"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={8}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Text style={{ fontSize: "12px", color: "#71717a" }}>
                        Difficulty
                      </Text>
                      <Select
                        placeholder="All Difficulties"
                        style={{ width: "100%" }}
                        value={selectedDifficulty}
                        onChange={setSelectedDifficulty}
                        allowClear
                      >
                        {difficulties.map((diff) => (
                          <Option key={diff} value={diff}>
                            <Tag
                              color={getDifficultyColor(diff)}
                              style={{ margin: 0 }}
                            >
                              {diff}
                            </Tag>
                          </Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Text style={{ fontSize: "12px", color: "#71717a" }}>
                        Category
                      </Text>
                      <Select
                        placeholder="All Categories"
                        style={{ width: "100%" }}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        allowClear
                      >
                        {categories.map((cat) => (
                          <Option key={cat} value={cat}>
                            <Tag
                              color={getCategoryColor(cat)}
                              style={{ margin: 0 }}
                            >
                              {cat}
                            </Tag>
                          </Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                  <Col xs={24} sm={24} lg={8}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Text style={{ fontSize: "12px", color: "#71717a" }}>
                        Results
                      </Text>
                      <Statistic
                        value={filteredQuestions.length}
                        suffix={`/ ${allQuestions.length}`}
                        valueStyle={{ fontSize: "20px", color: "#0ea5e9" }}
                      />
                    </Space>
                  </Col>
                </Row>
              </Space>
            </Card>

            {/* Questions Section */}
            <div>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <Text strong style={{ fontSize: "16px", color: "#fafafa" }}>
                    {filteredQuestions.length} Question
                    {filteredQuestions.length !== 1 ? "s" : ""} Found
                  </Text>
                  {hasActiveFilters && (
                    <Text style={{ fontSize: "14px", color: "#71717a" }}>
                      (Filtered from {allQuestions.length} total)
                    </Text>
                  )}
                </div>

                {filteredQuestions.length === 0 ? (
                  <Empty
                    description={
                      <Text style={{ color: "#a1a1aa" }}>
                        No questions match your filters. Try adjusting your
                        selection.
                      </Text>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Collapse
                    accordion={false}
                    expandIconPosition="end"
                    style={{ background: "transparent", border: "none" }}
                  >
                    {filteredQuestions.map((item, index) => (
                      <Panel
                        key={index}
                        header={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <QuestionCircleOutlined
                              style={{ color: "#0ea5e9", fontSize: "20px" }}
                            />
                            <Text
                              strong
                              style={{
                                fontSize: "15px",
                                flex: 1,
                                minWidth: "200px",
                                color: "#fafafa",
                              }}
                            >
                              {item.question || `Question ${index + 1}`}
                            </Text>
                            <Space size="small" wrap>
                              {item.difficulty && (
                                <Tag
                                  color={getDifficultyColor(item.difficulty)}
                                  style={{
                                    fontSize: "12px",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {item.difficulty.toUpperCase()}
                                </Tag>
                              )}
                              {item.category && (
                                <Tag
                                  color={getCategoryColor(item.category)}
                                  style={{
                                    fontSize: "12px",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {item.category}
                                </Tag>
                              )}
                            </Space>
                          </div>
                        }
                        style={{
                          marginBottom: "16px",
                          background: "rgba(39, 39, 42, 0.7)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(14, 165, 233, 0.05)",
                            borderRadius: "10px",
                            padding: "16px",
                            marginTop: "8px",
                            border: "1px solid rgba(14, 165, 233, 0.1)",
                          }}
                        >
                          <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                          >
                            <div>
                              <Space size="small">
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    background:
                                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <BulbOutlined
                                    style={{ color: "#fff", fontSize: "16px" }}
                                  />
                                </div>
                                <Text
                                  strong
                                  style={{ fontSize: "16px", color: "#fafafa" }}
                                >
                                  Tips for Answering
                                </Text>
                              </Space>
                            </div>

                            {item.tips && item.tips.length > 0 ? (
                              <Space
                                direction="vertical"
                                size="small"
                                style={{ width: "100%", paddingLeft: "8px" }}
                              >
                                {item.tips.map((tip, tipIndex) => (
                                  <div
                                    key={tipIndex}
                                    style={{
                                      background: "rgba(39, 39, 42, 0.8)",
                                      borderRadius: "8px",
                                      padding: "12px",
                                      borderLeft: "3px solid #10b981",
                                    }}
                                  >
                                    <Space align="start" size="small">
                                      <CheckCircleOutlined
                                        style={{
                                          color: "#10b981",
                                          fontSize: "16px",
                                          marginTop: "2px",
                                        }}
                                      />
                                      <Paragraph
                                        style={{
                                          margin: 0,
                                          fontSize: "14px",
                                          lineHeight: "1.7",
                                          color: "#a1a1aa",
                                        }}
                                      >
                                        {tip}
                                      </Paragraph>
                                    </Space>
                                  </div>
                                ))}
                              </Space>
                            ) : (
                              <Text
                                style={{
                                  paddingLeft: "40px",
                                  color: "#71717a",
                                }}
                              >
                                No tips available for this question.
                              </Text>
                            )}
                          </Space>
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                )}
              </Space>
            </div>
          </>
        )}
      </Space>
    </div>
  );
}
