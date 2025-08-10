import express from "express";
import cors from "cors";
import { downloadDicomFile } from "./dicom-downloader.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "The server is running" });
});

app.post("/api/dicom-metadata", async (req, res) => {
  try {
    const { s3Path } = req.body;

    // Validate request body
    if (!s3Path) {
      return res.status(400).json({
        error: "Missing required field: s3Path",
        message: "Please provide an S3 path in the request body",
      });
    }

    if (typeof s3Path !== "string") {
      return res.status(400).json({
        error: "Invalid s3Path format",
        message: "s3Path must be a string",
      });
    }

    // Download and parse DICOM file
    const metadata = await downloadDicomFile(s3Path);

    res.json({
      success: true,
      s3Path,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing DICOM metadata request:", error);

    // Handle specific error types
    if (error.message.includes("S3 client not initialized")) {
      return res.status(500).json({
        error: "Server configuration error",
        message: "S3 client not properly configured. Check server logs.",
      });
    }

    if (error.message.includes("DICOM file not found")) {
      return res.status(404).json({
        error: "File not found",
        message: error.message,
      });
    }

    if (error.message.includes("Access denied")) {
      return res.status(403).json({
        error: "Access denied",
        message: error.message,
      });
    }

    if (error.message.includes("Invalid S3 path format")) {
      return res.status(400).json({
        error: "Invalid S3 path",
        message: error.message,
      });
    }

    if (error.message.includes("Failed to parse DICOM file")) {
      return res.status(422).json({
        error: "Invalid DICOM file",
        message: error.message,
      });
    }

    // Generic error response
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while processing your request",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
