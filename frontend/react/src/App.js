import React, { useState } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
} from "@mui/material";
import S3PathForm from "./components/S3PathForm";
import MetadataDisplay from "./components/MetadataDisplay";
import dicomService from "./services/dicomService";
import "./App.css";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (s3Path) => {
    setLoading(true);
    setError("");
    setMetadata(null);

    try {
      const result = await dicomService.getMetadata(s3Path);
      setMetadata(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <img
            src="/aidoc-logo-full-color.png"
            width="192"
            alt="Aidoc Logo"
            style={{ marginBottom: "16px" }}
          />
          <h1 style={{ margin: 0, color: "#1976d2" }}>DICOM Metadata Viewer</h1>
        </Box>

        <S3PathForm onSubmit={handleSubmit} loading={loading} error={error} />

        <MetadataDisplay metadata={metadata} loading={loading} error={error} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
