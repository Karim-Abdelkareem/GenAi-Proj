/**
 * InterviewReport Page
 * Full-page report viewer with navigation, print/export functionality
 * @module pages/interviewReport
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Space, Typography, Spin, Alert, message } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import InterviewReport from "../components/InterviewReport";
import interviewService from "../services/interviewApi";
import MainLayout from "../components/layouts/MainLayout";

const { Title } = Typography;

/**
 * InterviewReport Page Component
 * Displays comprehensive interview report for a specific session
 */
export default function InterviewReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!sessionId) {
        setError("Session ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const reportData = await interviewService.getInterviewReport(sessionId);
        setReport(reportData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError(err.response?.data?.message || "Failed to load interview report");
        message.error("Failed to load interview report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement PDF export
    message.info("Export functionality coming soon");
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Typography.Text>Loading interview report...</Typography.Text>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: "24px" }}>
          <Alert
            message="Error Loading Report"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => navigate("/interview-prep")}>
                Back to Interviews
              </Button>
            }
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: "24px" }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header */}
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/interview-prep")}
                >
                  Back to Interviews
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  Interview Report
                </Title>
              </Space>
              <Space>
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  Print
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  Export PDF
                </Button>
              </Space>
            </Space>

            {/* Report Content */}
            <InterviewReport report={report} sessionId={sessionId} />
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
}











