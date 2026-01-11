import { io } from "socket.io-client";
import { getTokenInfo, validateToken, isTokenExpired } from "./tokenUtils";

const BASE_URL = "http://localhost:3000";

/**
 * Test REST API connection with token
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Test result
 */
export const testRestApiConnection = async (token) => {
  const result = {
    success: false,
    error: null,
    status: null,
    message: "",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/interview/questions/sessions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    result.status = response.status;
    result.success = response.ok;

    if (response.ok) {
      result.message = "REST API connection successful";
    } else {
      const errorData = await response.json().catch(() => ({}));
      result.error = errorData.message || `HTTP ${response.status}`;
      result.message = `REST API connection failed: ${result.error}`;
    }
  } catch (error) {
    result.error = error.message;
    result.message = `REST API connection error: ${error.message}`;
  }

  return result;
};

/**
 * Test Socket.io connection
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Test result
 */
export const testSocketConnection = (token) => {
  return new Promise((resolve) => {
    const result = {
      success: false,
      error: null,
      message: "",
      socketId: null,
    };

    const socket = io(BASE_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      result.error = "Connection timeout";
      result.message = "Socket connection timed out after 5 seconds";
      resolve(result);
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(timeout);
      result.success = true;
      result.socketId = socket.id;
      result.message = "Socket connection successful";
      socket.disconnect();
      resolve(result);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      result.error = error.message;
      result.message = `Socket connection failed: ${error.message}`;
      socket.disconnect();
      resolve(result);
    });

    socket.on("disconnect", () => {
      // Connection test complete
    });
  });
};

/**
 * Run comprehensive connection diagnostics
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Diagnostic report
 */
export const runConnectionDiagnostics = async (token) => {
  const report = {
    timestamp: new Date().toISOString(),
    tokenInfo: getTokenInfo(token),
    restApiTest: null,
    socketTest: null,
    summary: {
      allTestsPassed: false,
      issues: [],
      recommendations: [],
    },
  };

  // Ensure summary is always initialized
  if (!report.summary) {
    report.summary = {
      allTestsPassed: false,
      issues: [],
      recommendations: [],
    };
  }

  // Token validation
  if (!token) {
    report.summary.issues.push("Token is missing");
    report.summary.recommendations.push("Please log in to get a valid token");
    return report;
  }

  if (!validateToken(token)) {
    report.summary.issues.push("Token has invalid format");
    report.summary.recommendations.push("Token should be a valid JWT with 3 parts");
    return report;
  }

  if (isTokenExpired(token)) {
    report.summary.issues.push("Token is expired");
    report.summary.recommendations.push("Please log in again to get a fresh token");
  }

  // Test REST API
  console.log("Testing REST API connection...");
  report.restApiTest = await testRestApiConnection(token);
  if (!report.restApiTest.success) {
    report.summary.issues.push(`REST API: ${report.restApiTest.error}`);
    if (report.restApiTest.status === 401) {
      report.summary.recommendations.push("Token may be invalid or expired");
    } else if (report.restApiTest.status === 0) {
      report.summary.recommendations.push("Server may not be running");
    }
  }

  // Test Socket.io
  console.log("Testing Socket.io connection...");
  report.socketTest = await testSocketConnection(token);
  if (!report.socketTest.success) {
    report.summary.issues.push(`Socket.io: ${report.socketTest.error}`);
    if (report.socketTest.error?.includes("timeout")) {
      report.summary.recommendations.push("Server may not be running or not responding");
    } else if (report.socketTest.error?.includes("authentication")) {
      report.summary.recommendations.push("Token authentication failed on server");
    }
  }

  // Summary
  report.summary.allTestsPassed =
    report.restApiTest.success && report.socketTest.success;

  if (report.summary.allTestsPassed) {
    report.summary.recommendations.push("All connection tests passed!");
  }

  return report;
};

