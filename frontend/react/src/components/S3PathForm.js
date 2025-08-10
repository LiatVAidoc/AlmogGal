import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const S3PathForm = ({ onSubmit, loading, error }) => {
  const [s3Path, setS3Path] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateS3Path = (path) => {
    if (!path.trim()) {
      return "S3 path is required";
    }

    // Accept both full s3:// URLs and relative S3 paths
    if (path.startsWith("s3://")) {
      // Full S3 URL format
      if (path.length < 10) {
        return "S3 path seems too short";
      }
    } else {
      // Relative S3 path format (like: bucket-name/path/to/file)
      if (path.length < 5) {
        return "S3 path seems too short";
      }
      // Check if it contains at least one slash (bucket/path structure)
      if (!path.includes("/")) {
        return "S3 path should include bucket and path structure";
      }
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateS3Path(s3Path);

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    onSubmit(s3Path);
  };

  const handlePathChange = (e) => {
    setS3Path(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          DICOM Metadata Viewer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter an S3 path to view DICOM metadata
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="S3 Path"
            placeholder="bucket-name/path/to/file.dcm or s3://bucket-name/path/to/file"
            value={s3Path}
            onChange={handlePathChange}
            error={!!validationError}
            helperText={
              validationError ||
              "Enter the S3 path to your DICOM file (with or without s3:// prefix)"
            }
            disabled={loading}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            startIcon={<CloudUpload />}
            disabled={loading || !s3Path.trim()}
            fullWidth
            size="large"
          >
            {loading ? "Loading..." : "View Metadata"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default S3PathForm;
