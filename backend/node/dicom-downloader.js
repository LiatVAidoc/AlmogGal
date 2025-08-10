import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { fileURLToPath } from "url";
import * as dicomParser from "dicom-parser";

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let s3Client;

// Setup AWS credentials from secrets.json
try {
  const secrets = JSON.parse(
    fs.readFileSync(path.join(__dirname, "secrets.json"))
  );
  s3Client = new S3Client({
    region: secrets.REGION || "us-east-2",
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
      sessionToken: secrets.AWS_SESSION_TOKEN,
    },
  });
} catch (error) {
  console.error("Error loading secrets.json:", error.message);
}

/**
 * Downloads a DICOM file from S3 and extracts its metadata
 * @param {string} s3Path - Path to the DICOM file in S3 (bucket-name/path/to/file.dcm)
 * @returns {Object} - Object containing the DICOM metadata
 */
async function downloadDicomFile(s3Path) {
  if (!s3Client) {
    throw new Error("S3 client not initialized. Check secrets.json file.");
  }

  if (!s3Path || typeof s3Path !== "string") {
    throw new Error("S3 path is required and must be a string");
  }

  // Parse S3 path to extract bucket and key
  const pathParts = s3Path.split("/");
  if (pathParts.length < 2) {
    throw new Error(
      "Invalid S3 path format. Expected: bucket-name/path/to/file.dcm"
    );
  }

  const bucket = pathParts[0];
  const key = pathParts.slice(1).join("/");

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("No data received from S3");
    }

    // Convert the response body to a buffer
    const chunks = [];
    const reader = response.Body.transformToByteArray();

    for await (const chunk of reader) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Parse the DICOM file and extract metadata
    return parseDicomFile(buffer);
  } catch (error) {
    if (error.name === "NoSuchKey") {
      throw new Error(`DICOM file not found at path: ${s3Path}`);
    } else if (error.name === "AccessDenied") {
      throw new Error("Access denied to S3 bucket. Check your credentials.");
    } else {
      throw new Error(`Failed to download DICOM file: ${error.message}`);
    }
  }
}

/**
 * Parses DICOM file and extracts metadata
 * @param {Buffer} buffer - Buffer containing DICOM file data
 * @returns {Object} - Object containing DICOM metadata
 */
function parseDicomFile(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Input must be a Buffer");
  }

  try {
    const dataSet = dicomParser.parseDicom(buffer);

    // Extract common DICOM tags
    const metadata = {
      // Patient information
      PatientID: dataSet.string("x00100020") || "N/A",
      PatientName: dataSet.string("x00100010") || "N/A",

      // Study information
      StudyDate: dataSet.string("x00080020") || "N/A",
      StudyTime: dataSet.string("x00080030") || "N/A",
      StudyDescription: dataSet.string("x00081030") || "N/A",
      StudyInstanceUID: dataSet.string("x0020000d") || "N/A",

      // Series information
      SeriesNumber: dataSet.string("x00200011") || "N/A",
      SeriesDescription: dataSet.string("x0008103e") || "N/A",
      SeriesInstanceUID: dataSet.string("x0020000e") || "N/A",

      // Image information
      Modality: dataSet.string("x00080060") || "N/A",
      ImageType: dataSet.string("x00080008") || "N/A",
      ImageComments: dataSet.string("x00082040") || "N/A",

      // Institution information
      InstitutionName: dataSet.string("x00080080") || "N/A",
      InstitutionAddress: dataSet.string("x00080081") || "N/A",

      // Equipment information
      Manufacturer: dataSet.string("x00080070") || "N/A",
      ManufacturerModelName: dataSet.string("x00081090") || "N/A",

      // Technical information
      SliceThickness: dataSet.float("x00180050") || "N/A",
      PixelSpacing: dataSet.string("x00280030") || "N/A",
      ImageRows: dataSet.uint16("x00280010") || "N/A",
      ImageColumns: dataSet.uint16("x00280011") || "N/A",

      // Additional metadata
      SOPClassUID: dataSet.string("x00080016") || "N/A",
      TransferSyntaxUID: dataSet.string("x00020010") || "N/A",
    };

    return metadata;
  } catch (error) {
    throw new Error(`Failed to parse DICOM file: ${error.message}`);
  }
}

export { downloadDicomFile, parseDicomFile };
