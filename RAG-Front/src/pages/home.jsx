import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Button,
} from "antd";
import {
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const { Title } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const { user, documentData } = useAuthStore();

  // Check if document is uploaded by verifying fileName or fileType exists
  const hasDocument =
    documentData && (documentData.fileName || documentData.fileType);
  const atsScore = documentData?.atsScore?.score || 0;
  const yearsOfExperience = documentData?.yearsOfExperience;

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const stats = [
    {
      title: "Profile Status",
      value: hasDocument ? "Complete" : "Incomplete",
      icon: hasDocument ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
      color: hasDocument ? "#10b981" : "#ef4444",
      gradient: hasDocument 
        ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)",
    },
    {
      title: "ATS Score",
      value: hasDocument ? atsScore : "N/A",
      suffix: hasDocument ? " / 100" : "",
      icon: <TrophyOutlined />,
      color: hasDocument ? getScoreColor(atsScore) : "#71717a",
      gradient: hasDocument
        ? `linear-gradient(135deg, ${getScoreColor(atsScore)}20 0%, ${getScoreColor(atsScore)}08 100%)`
        : "linear-gradient(135deg, rgba(113, 113, 122, 0.15) 0%, rgba(113, 113, 122, 0.05) 100%)",
    },
    {
      title: "Experience",
      value: yearsOfExperience !== undefined && yearsOfExperience !== null ? yearsOfExperience : "N/A",
      suffix: yearsOfExperience !== undefined && yearsOfExperience !== null 
        ? (yearsOfExperience === 1 ? " year" : " years") 
        : "",
      icon: <CalendarOutlined />,
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)",
    },
    {
      title: "Technical Skills",
      value: documentData?.technicalSkills?.length || 0,
      suffix: " skills",
      icon: <UserOutlined />,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Welcome Card */}
        <Card
          style={{
            background: `
              linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%),
              rgba(39, 39, 42, 0.7)
            `,
            borderColor: "rgba(14, 165, 233, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(14, 165, 233, 0.35)",
              }}
            >
              <span style={{ fontSize: "28px" }}>👋</span>
            </div>
            <div>
              <Title level={2} style={{ margin: 0, color: "#fafafa" }}>
                Welcome back, {user?.name || user?.email?.split("@")[0]}!
              </Title>
              <Typography.Text style={{ color: "#a1a1aa", fontSize: "16px" }}>
                Here's an overview of your profile
              </Typography.Text>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                style={{
                  background: stat.gradient,
                  borderColor: `${stat.color}30`,
                  height: "100%",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <Typography.Text style={{ color: "#a1a1aa", fontSize: "13px", fontWeight: 500 }}>
                      {stat.title}
                    </Typography.Text>
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "32px", fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </span>
                      {stat.suffix && (
                        <span style={{ fontSize: "14px", color: "#71717a" }}>
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: `${stat.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      fontSize: "22px",
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to action if no document */}
        {!hasDocument && (
          <Card
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)",
              border: "none",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Background decoration */}
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "20%",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                pointerEvents: "none",
              }}
            />
            
            <Row align="middle" justify="space-between" style={{ position: "relative", zIndex: 1 }}>
              <Col>
                <Space direction="vertical" size="small">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileTextOutlined style={{ fontSize: "24px", color: "#fff" }} />
                    </div>
                    <div>
                      <Title level={4} style={{ color: "#fff", margin: 0 }}>
                        Complete Your Profile
                      </Title>
                      <Typography.Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                        Upload your resume to get started with ATS scoring and job matching
                      </Typography.Text>
                    </div>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/profile")}
                  style={{
                    background: "#fff",
                    color: "#0284c7",
                    border: "none",
                    fontWeight: 600,
                    height: "48px",
                    padding: "0 28px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Upload Resume <ArrowRightOutlined />
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* Document info and quick actions */}
        {hasDocument && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>
                    📄 Document Information
                  </span>
                }
                style={{ height: "100%" }}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "rgba(14, 165, 233, 0.1)",
                      borderRadius: "10px",
                      border: "1px solid rgba(14, 165, 233, 0.2)",
                    }}
                  >
                    <Typography.Text style={{ color: "#a1a1aa" }}>File Name</Typography.Text>
                    <Typography.Text style={{ color: "#fafafa", fontWeight: 500 }}>
                      {documentData?.fileName || "N/A"}
                    </Typography.Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "rgba(245, 158, 11, 0.1)",
                      borderRadius: "10px",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    <Typography.Text style={{ color: "#a1a1aa" }}>File Type</Typography.Text>
                    <Tag 
                      color="blue"
                      style={{
                        margin: 0,
                        background: "rgba(14, 165, 233, 0.15)",
                        borderColor: "rgba(14, 165, 233, 0.3)",
                        color: "#38bdf8",
                      }}
                    >
                      {documentData?.fileType?.toUpperCase() || "N/A"}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>
                    ⚡ Quick Actions
                  </span>
                }
                style={{ height: "100%" }}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => navigate("/profile")}
                    style={{
                      height: "48px",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    View Full Profile
                  </Button>
                  <Button 
                    block 
                    size="large"
                    onClick={() => navigate("/profile")}
                    style={{
                      height: "48px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      color: "#fafafa",
                    }}
                  >
                    Update Resume
                  </Button>
                  <Button 
                    block 
                    size="large"
                    icon={<FileSearchOutlined />}
                    onClick={() => navigate("/cv-analysis")}
                    style={{
                      height: "48px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)",
                      borderColor: "rgba(14, 165, 233, 0.3)",
                      color: "#38bdf8",
                    }}
                  >
                    CV Analysis Dashboard
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </Space>
    </div>
  );
}
