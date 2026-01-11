const BASE_URL = "http://localhost:3000";

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  return data;
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message || "Registration failed");
  }

  const data = await response.json();
  return data;
};

export const uploadPdf = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || "Upload failed");
  }

  const data = await response.json();
  return data;
};

export const getUploadStatus = async (jobId, token) => {
  const response = await fetch(`${BASE_URL}/upload-pdf/status/${jobId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response);
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get upload status" }));
    throw new Error(error.message || "Failed to get upload status");
  }

  const data = await response.json();
  return data;
};

export const getDocument = async (token) => {
  const response = await fetch(`${BASE_URL}/upload-pdf/document`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get document" }));
    throw new Error(error.message || "Failed to get document");
  }

  const data = await response.json();
  return data;
};
