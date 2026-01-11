/**
 * InterviewTypeModal Component
 * Modal for selecting interview type (Text or Voice) and voice gender
 * @module components/InterviewTypeModal
 */

import React, { useState } from "react";
import { Modal, Radio, Space, Typography, Divider } from "antd";
import { MessageOutlined, AudioOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

/**
 * Interview Type Selection Modal
 * @param {boolean} visible - Modal visibility
 * @param {Function} onStart - Callback with { type: 'text' | 'voice', voiceGender?: 'male' | 'female' | 'neutral' }
 * @param {Function} onCancel - Cancel callback
 * @returns {JSX.Element} - Modal component
 */
const InterviewTypeModal = ({ visible, onStart, onCancel }) => {
  const [interviewType, setInterviewType] = useState("text");
  const [voiceGender, setVoiceGender] = useState("neutral");

  const handleStart = () => {
    if (interviewType === "voice") {
      onStart({ type: "voice", voiceGender });
    } else {
      onStart({ type: "text" });
    }
    // Reset state
    setInterviewType("text");
    setVoiceGender("neutral");
  };

  const handleCancel = () => {
    onCancel();
    // Reset state
    setInterviewType("text");
    setVoiceGender("neutral");
  };

  return (
    <Modal
      title="Select Interview Type"
      open={visible}
      onOk={handleStart}
      onCancel={handleCancel}
      okText="Start Interview"
      cancelText="Cancel"
      width={500}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={5}>Choose Interview Mode</Title>
          <Radio.Group
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 12 }}>
              <Radio value="text" style={{ width: "100%" }}>
                <Space>
                  <MessageOutlined />
                  <div>
                    <Text strong>Text Interview</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Type your responses and receive text-based AI feedback
                    </Text>
                  </div>
                </Space>
              </Radio>
              <Radio value="voice" style={{ width: "100%" }}>
                <Space>
                  <AudioOutlined />
                  <div>
                    <Text strong>Voice Interview</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Speak naturally and have a real-time voice conversation
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {interviewType === "voice" && (
          <>
            <Divider />
            <div>
              <Title level={5}>Select AI Voice</Title>
              <Radio.Group
                value={voiceGender}
                onChange={(e) => setVoiceGender(e.target.value)}
                style={{ width: "100%", marginTop: 12 }}
              >
                <Space direction="vertical" size="small">
                  <Radio value="male">
                    <Text>Male Voice</Text>
                  </Radio>
                  <Radio value="female">
                    <Text>Female Voice</Text>
                  </Radio>
                  <Radio value="neutral">
                    <Text>Neutral Voice (Default)</Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default InterviewTypeModal;












