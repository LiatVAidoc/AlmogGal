import axios from "axios";

// You can configure the base URL based on your backend setup
const API_BASE_URL = process.env.REACT_APP_API_URL;

const dicomService = {
  async getMetadata(s3Path) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/dicom-metadata`, {
        s3Path,
      });
      return response.data?.metadata;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new Error(
          error.response.data.message || "Failed to fetch metadata"
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(
          "No response from server. Please check your connection."
        );
      } else {
        // Something else happened
        throw new Error("An error occurred while processing your request.");
      }
    }
  },

  // Helper method to validate S3 path format
  validateS3Path(path) {
    const s3PathRegex = /^s3:\/\/[a-zA-Z0-9\-_\.]+\/[a-zA-Z0-9\-_\.\/]*$/;
    return s3PathRegex.test(path);
  },
};

export default dicomService;
