import React from "react";
import { Layout, App, ConfigProvider, theme } from "antd";
import Navbar from "../Navbar";

const { Content } = Layout;

export default function MainLayout({ children }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#0ea5e9",
          colorBgBase: "#09090b",
          colorBgContainer: "rgba(39, 39, 42, 0.7)",
          colorBgElevated: "rgba(39, 39, 42, 0.95)",
          colorBorder: "rgba(255, 255, 255, 0.08)",
          colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          colorTextTertiary: "#71717a",
          borderRadius: 12,
        },
        components: {
          Card: {
            colorBgContainer: "rgba(39, 39, 42, 0.7)",
            colorBorderSecondary: "rgba(255, 255, 255, 0.08)",
          },
          List: {
            colorBgContainer: "transparent",
          },
          Modal: {
            contentBg: "rgba(39, 39, 42, 0.95)",
            headerBg: "rgba(39, 39, 42, 0.95)",
          },
          Select: {
            colorBgContainer: "rgba(39, 39, 42, 0.9)",
            colorBgElevated: "rgba(39, 39, 42, 0.95)",
          },
          Input: {
            colorBgContainer: "rgba(39, 39, 42, 0.9)",
          },
          Collapse: {
            colorBgContainer: "rgba(39, 39, 42, 0.7)",
            headerBg: "rgba(39, 39, 42, 0.9)",
          },
          Progress: {
            remainingColor: "rgba(255, 255, 255, 0.1)",
          },
        },
      }}
    >
      <App>
        <Layout style={{ minHeight: "100vh", background: "#09090b" }}>
          <Navbar />
          <Content
            style={{
              padding: "24px",
              background: `
                radial-gradient(ellipse at top left, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.05) 0%, transparent 50%),
                linear-gradient(180deg, #09090b 0%, #18181b 100%)
              `,
            }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>{children}</div>
          </Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
