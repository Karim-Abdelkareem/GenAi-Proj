import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Upload,
  Button,
  Typography,
  Descriptions,
  Tag,
  Progress,
  Alert,
  Space,
  Row,
  Col,
  Divider,
  List,
  Spin,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkedinOutlined,
  GithubOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { App } from "antd";
import { uploadPdf, getUploadStatus, getDocument } from "../api/auth";
import useAuthStore from "../store/authStore";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// Helper function to ensure URLs are absolute
const normalizeUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export default function Profile() {
  const { message } = App.useApp();
  const { documentData, token, updateDocumentData } = useAuthStore();
  const [fileList, setFileList] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const pollingIntervalRef = useRef(null);

  // Check if document is uploaded by verifying fileName or fileType exists
  const hasDocument =
    documentData && (documentData.fileName || documentData.fileType);
  const [showUpload, setShowUpload] = useState(!hasDocument);

  // Fetch document data on component mount
  const { isLoading: isLoadingDocument } = useQuery({
    queryKey: ["document", token],
    queryFn: () => getDocument(token),
    enabled: !!token && !documentData,
    retry: 1,
    onSuccess: (data) => {
      if (data.status === "success" && data.data && data.data.document) {
        updateDocumentData(data.data.document);
      }
    },
    onError: (error) => {
      // Silently fail if no document exists
      console.log("No document found or error:", error.message);
    },
  });

  // Polling function to check job status
  const pollJobStatus = useCallback(
    async (currentJobId) => {
      if (!currentJobId || !token) return;

      try {
        const statusData = await getUploadStatus(currentJobId, token);

        if (statusData.status === "success" && statusData.data) {
          const { status, progress, document } = statusData.data;

          setJobStatus(status);
          setJobProgress(progress || 0);

          if (status === "completed") {
            // Stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            // Fetch the updated document data from the server
            try {
              const documentResponse = await getDocument(token);
              if (
                documentResponse.status === "success" &&
                documentResponse.data &&
                documentResponse.data.document
              ) {
                updateDocumentData(documentResponse.data.document);
                console.log(
                  "Document data updated:",
                  documentResponse.data.document
                );
              } else if (document) {
                // Fallback: use document from status response if available
                updateDocumentData(document);
              }
            } catch (docError) {
              console.error(
                "Error fetching document after completion:",
                docError
              );
              // Fallback: use document from status response if available
              if (document) {
                updateDocumentData(document);
              }
            }

            setFileList([]);
            setShowUpload(false);
            setJobId(null);
            setJobStatus(null);
            setJobProgress(0);
            message.success("Document processed successfully!");
          } else if (status === "failed") {
            // Stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setJobId(null);
            setJobStatus(null);
            setJobProgress(0);
            message.error("Document processing failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error polling job status:", error);
        // Continue polling even if there's an error
      }
    },
    [token, updateDocumentData, message]
  );

  // Start polling when jobId is set
  useEffect(() => {
    if (jobId && token) {
      // Poll immediately after a short delay to avoid cascading renders
      const immediateTimeout = setTimeout(() => {
        pollJobStatus(jobId);
      }, 100);

      // Then poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(jobId);
      }, 2000);

      return () => {
        clearTimeout(immediateTimeout);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [jobId, token, pollJobStatus]);

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadPdf(file, token),
    onSuccess: (data) => {
      if (data.status === "success" && data.data) {
        const { jobId: newJobId, status, document } = data.data;

        setJobId(newJobId);
        setJobStatus(status);
        setJobProgress(0);

        // If document exists in response (old CV), update it
        if (document) {
          updateDocumentData(document);
        }

        message.info(
          data.message || "Upload started. Processing will begin shortly."
        );
      }
    },
    onError: (error) => {
      message.error(error.message || "Upload failed. Please try again.");
      setFileList([]);
    },
  });

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning("Please select a file to upload");
      return;
    }

    // Get the file - it could be the file object itself or have originFileObj
    const fileItem = fileList[0];
    const file = fileItem.originFileObj || fileItem;

    if (!file || !(file instanceof File)) {
      message.warning("Please select a valid file");
      return;
    }

    if (documentData) {
      message.warning(
        "Uploading a new document will replace your existing one. This action cannot be undone."
      );
    }

    uploadMutation.mutate(file);
  };

  const uploadProps = {
    fileList,
    beforeUpload: (file) => {
      const isPdf = file.type === "application/pdf";
      const isDocx =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const isValid = isPdf || isDocx;

      if (!isValid) {
        message.error("You can only upload PDF or DOCX files!");
        return Upload.LIST_IGNORE;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File must be smaller than 10MB!");
        return Upload.LIST_IGNORE;
      }

      // Store the file with originFileObj preserved for later access
      setFileList([
        {
          uid: file.uid || `-${Date.now()}`,
          name: file.name,
          status: "done",
          originFileObj: file,
        },
      ]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    accept: ".pdf,.docx",
    maxCount: 1,
  };

  const atsScore = documentData?.atsScore?.score || 0;
  const breakdown = documentData?.atsScore?.breakdown || {};
  const feedback = documentData?.atsScore?.feedback || {};
  const personalInfo = documentData?.personalInformation || {};
  const technicalSkills = documentData?.technicalSkills || [];
  const education = documentData?.education || [];
  const yearsOfExperience = documentData?.yearsOfExperience;

  if (isLoadingDocument) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text type="secondary">Loading document data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Title level={2} style={{ margin: 0 }}>
            Profile
          </Title>
          <Text type="secondary">
            Manage your resume and profile information
          </Text>
        </Card>

        {showUpload && (
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Upload Resume</span>
              </Space>
            }
          >
            <Space
              orientation="vertical"
              size="large"
              style={{ width: "100%" }}
            >
              {documentData && (
                <Alert
                  title="Replace Existing Document"
                  description="Uploading a new document will remove your current resume and all associated data. This action cannot be undone."
                  type="warning"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
              )}

              {/* Show processing status if job is in progress */}
              {jobId && jobStatus && jobStatus !== "completed" && (
                <Card size="small">
                  <Space
                    orientation="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong>Processing your document...</Text>
                      <Text type="secondary" style={{ marginLeft: "8px" }}>
                        {jobStatus === "pending"
                          ? "Job created, starting processing..."
                          : jobStatus === "processing"
                          ? "Analyzing your CV..."
                          : "Processing..."}
                      </Text>
                    </div>
                    <Progress
                      percent={jobProgress}
                      status="active"
                      format={(percent) => `${percent}%`}
                    />
                  </Space>
                </Card>
              )}

              <Dragger
                {...uploadProps}
                style={{ padding: "40px" }}
                disabled={!!jobId && jobStatus !== "completed"}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined
                    style={{ fontSize: "48px", color: "#1890ff" }}
                  />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for PDF and DOCX files only. Maximum file size: 10MB
                </p>
              </Dragger>

              <Button
                type="primary"
                size="large"
                onClick={handleUpload}
                loading={
                  uploadMutation.isPending ||
                  (jobId && jobStatus !== "completed")
                }
                disabled={
                  fileList.length === 0 ||
                  (!!jobId && jobStatus !== "completed")
                }
                block
              >
                {uploadMutation.isPending
                  ? "Uploading..."
                  : jobId && jobStatus !== "completed"
                  ? "Processing..."
                  : "Upload Resume"}
              </Button>
            </Space>
          </Card>
        )}

        {hasDocument && !showUpload && (
          <>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>Personal Information</span>
                </Space>
              }
              extra={
                <Button onClick={() => setShowUpload(true)}>
                  Upload New Resume
                </Button>
              }
            >
              <Row gutter={[24, 24]}>
                {/* Basic Information */}
                <Col xs={24} lg={12}>
                  <Space
                    orientation="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Space size="middle">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <UserOutlined
                            style={{ color: "#fff", fontSize: "18px" }}
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Full Name
                          </Text>
                          <div className="capitalize">
                            <Text strong style={{ fontSize: "16px" }}>
                              {personalInfo.fullName || "N/A"}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </div>

                    <div>
                      <Space size="middle">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MailOutlined
                            style={{ color: "#fff", fontSize: "18px" }}
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Email
                          </Text>
                          <div>
                            <Text style={{ fontSize: "16px" }}>
                              {personalInfo.email || "N/A"}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </div>

                    <div>
                      <Space size="middle">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PhoneOutlined
                            style={{ color: "#fff", fontSize: "18px" }}
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Phone
                          </Text>
                          <div>
                            <Text style={{ fontSize: "16px" }}>
                              {personalInfo.phone || "N/A"}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </div>

                    <div>
                      <Space size="middle">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EnvironmentOutlined
                            style={{ color: "#fff", fontSize: "18px" }}
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Location
                          </Text>
                          <div>
                            <Text style={{ fontSize: "16px" }}>
                              {personalInfo.location || "N/A"}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </div>

                    {yearsOfExperience !== undefined &&
                      yearsOfExperience !== null && (
                        <div>
                          <Space size="middle">
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background:
                                  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CalendarOutlined
                                style={{ color: "#fff", fontSize: "18px" }}
                              />
                            </div>
                            <div>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Years of Experience
                              </Text>
                              <div>
                                <Text style={{ fontSize: "16px" }}>
                                  {yearsOfExperience}{" "}
                                  {yearsOfExperience === 1 ? "year" : "years"}
                                </Text>
                              </div>
                            </div>
                          </Space>
                        </div>
                      )}
                  </Space>
                </Col>

                {/* Social Links & Summary */}
                <Col xs={24} lg={12}>
                  <Space
                    orientation="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {personalInfo.linkedin && (
                      <div>
                        <Space size="middle">
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background: "#0077b5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <LinkedinOutlined
                              style={{ color: "#fff", fontSize: "18px" }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              LinkedIn
                            </Text>
                            <div>
                              <a
                                href={normalizeUrl(personalInfo.linkedin)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "16px",
                                  wordBreak: "break-all",
                                }}
                              >
                                {personalInfo.linkedin}
                              </a>
                            </div>
                          </div>
                        </Space>
                      </div>
                    )}

                    {personalInfo.github && (
                      <div>
                        <Space size="middle">
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background: "#333",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <GithubOutlined
                              style={{ color: "#fff", fontSize: "18px" }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              GitHub
                            </Text>
                            <div>
                              <a
                                href={normalizeUrl(personalInfo.github)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "16px",
                                  wordBreak: "break-all",
                                }}
                              >
                                {personalInfo.github}
                              </a>
                            </div>
                          </div>
                        </Space>
                      </div>
                    )}

                    {personalInfo.portfolio && (
                      <div>
                        <Space size="middle">
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <GlobalOutlined
                              style={{ color: "#fff", fontSize: "18px" }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Portfolio
                            </Text>
                            <div>
                              <a
                                href={normalizeUrl(personalInfo.portfolio)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "16px",
                                  wordBreak: "break-all",
                                }}
                              >
                                {personalInfo.portfolio}
                              </a>
                            </div>
                          </div>
                        </Space>
                      </div>
                    )}

                            {personalInfo.summary && (
                              <div style={{ marginTop: "8px" }}>
                                <Text style={{ fontSize: "12px", color: "#71717a" }}>
                                  Summary
                                </Text>
                                <div style={{ marginTop: "8px" }}>
                                  <Paragraph
                                    style={{
                                      margin: 0,
                                      fontSize: "14px",
                                      lineHeight: "1.6",
                                      color: "#a1a1aa",
                                    }}
                                  >
                                    {personalInfo.summary}
                                  </Paragraph>
                                </div>
                              </div>
                            )}
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span>ATS Score</span>
                </Space>
              }
            >
              <Space
                orientation="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Space>
                    <Text strong>Overall Score: </Text>
                    <Progress
                      percent={atsScore}
                      status={
                        atsScore >= 80
                          ? "success"
                          : atsScore >= 60
                          ? "active"
                          : "exception"
                      }
                      format={(percent) => `${percent}/100`}
                    />
                  </Space>
                </div>

                <Divider>Score Breakdown</Divider>

                <Row gutter={[16, 16]}>
                  {Object.entries(breakdown).map(([key, value]) => (
                    <Col xs={24} sm={12} lg={8} key={key}>
                      <Card size="small">
                        <Space
                          orientation="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text strong style={{ textTransform: "capitalize" }}>
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </Text>
                          <Progress
                            percent={(value / 20) * 100}
                            size="small"
                            status={
                              value >= 15
                                ? "success"
                                : value >= 10
                                ? "active"
                                : "exception"
                            }
                          />
                          <Text type="secondary">{value}/20</Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Space>
            </Card>

            {technicalSkills.length > 0 && (
              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>Technical Skills</span>
                  </Space>
                }
              >
                <Space wrap>
                  {technicalSkills.map((skill, index) => (
                    <Tag
                      color="blue"
                      key={index}
                      style={{ marginBottom: "8px" }}
                    >
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}

            {education.length > 0 && (
              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>Education</span>
                  </Space>
                }
              >
                <List
                  dataSource={education}
                  renderItem={(item) => (
                    <List.Item>
                      <Space
                        orientation="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <Text strong>
                          {item.degree} in {item.field}
                        </Text>
                        <Text>{item.institution}</Text>
                        {item.location && (
                          <Text type="secondary">{item.location}</Text>
                        )}
                        <Text type="secondary">
                          {item.startDate} - {item.endDate}
                        </Text>
                        {item.gpa && (
                          <Text>
                            GPA: <Text strong>{item.gpa}</Text>
                          </Text>
                        )}
                        {item.honors && <Tag color="gold">{item.honors}</Tag>}
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {feedback && (
              <Row gutter={[16, 16]}>
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <Col xs={24} lg={8}>
                    <Card
                      title={
                        <Space>
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          <span>Strengths</span>
                        </Space>
                      }
                    >
                      <List
                        dataSource={feedback.strengths}
                        renderItem={(item) => (
                          <List.Item>
                            <Text>{item}</Text>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}

                {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                  <Col xs={24} lg={8}>
                    <Card
                      title={
                        <Space>
                          <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                          <span>Weaknesses</span>
                        </Space>
                      }
                    >
                      <List
                        dataSource={feedback.weaknesses}
                        renderItem={(item) => (
                          <List.Item>
                            <Text>{item}</Text>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}

                {feedback.recommendations &&
                  feedback.recommendations.length > 0 && (
                    <Col xs={24} lg={8}>
                      <Card
                        title={
                          <Space>
                            <InfoCircleOutlined style={{ color: "#1890ff" }} />
                            <span>Recommendations</span>
                          </Space>
                        }
                      >
                        <List
                          dataSource={feedback.recommendations}
                          renderItem={(item) => (
                            <List.Item>
                              <Text>{item}</Text>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  )}
              </Row>
            )}

            {/* <Card>
              <Space orientation="vertical" size="small">
                <Text strong>Document Information</Text>
                <Text type="secondary">
                  File Name: {documentData?.fileName || "N/A"}
                </Text>
                <Text type="secondary">
                  File Type: {documentData?.fileType?.toUpperCase() || "N/A"}
                </Text>
                <Text type="secondary">
                  Stored Chunks: {documentData?.stored || 0}
                </Text>
                {documentData?.atsScore?.analyzedAt && (
                  <Text type="secondary">
                    Analyzed At:{" "}
                    {new Date(
                      documentData.atsScore.analyzedAt
                    ).toLocaleString()}
                  </Text>
                )}
              </Space>
            </Card> */}
          </>
        )}
      </Space>
    </div>
  );
}
