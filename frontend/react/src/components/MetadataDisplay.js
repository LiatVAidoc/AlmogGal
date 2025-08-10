import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Skeleton,
} from "@mui/material";
import { Info, Warning } from "@mui/icons-material";

const MetadataDisplay = ({ metadata, loading, error }) => {
  if (loading) {
    return (
      <Card sx={{ maxWidth: 800, mx: "auto" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Loading metadata...
          </Typography>
          <Box sx={{ mt: 2 }}>
            {[...Array(10)].map((_, index) => (
              <Box key={index} sx={{ display: "flex", mb: 1 }}>
                <Skeleton width={200} height={20} />
                <Skeleton width={400} height={20} sx={{ ml: 2 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 800, mx: "auto" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Warning color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" color="error">
              Error Loading Metadata
            </Typography>
          </Box>
          <Typography color="text.secondary">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <Card sx={{ maxWidth: 800, mx: "auto" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Info color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">No Metadata Available</Typography>
          </Box>
          <Typography color="text.secondary">
            Enter an S3 path above to view DICOM metadata.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return <Chip label="null" size="small" variant="outlined" />;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    if (typeof value === "boolean") {
      return (
        <Chip
          label={value ? "true" : "false"}
          size="small"
          color={value ? "success" : "default"}
          variant="outlined"
        />
      );
    }

    return String(value);
  };

  const metadataEntries = Object.entries(metadata);

  return (
    <Card sx={{ maxWidth: 800, mx: "auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          DICOM Metadata
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {metadataEntries.length} metadata fields found
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Field</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metadataEntries.map(([key, value]) => (
                <TableRow key={key} hover>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      color: "primary.main",
                    }}
                  >
                    {key}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {formatValue(value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default MetadataDisplay;
