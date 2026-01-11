export const handleSocketError = (error, setError) => {
  if (error.message) {
    setError(error.message);
  } else if (error.response) {
    setError(error.response.data.message || "An error occurred");
  } else {
    setError("Connection error. Please try again.");
  }
};

