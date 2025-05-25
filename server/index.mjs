import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import B2 from "backblaze-b2";
import cors from "cors";
import { PDFDocument } from "pdf-lib";
import { processPaperForRag, processChunksForRag, generateRagResponse } from "./rag-service.mjs";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 15 * 1024 * 1024 },
});

// For metadata extraction only, we don't need to keep files permanently
const tempUpload = multer({
  dest: "temp/",
  limits: { fileSize: 15 * 1024 * 1024 },
});

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APP_KEY,
});

let cachedAuthTime = 0;

async function ensureAuthorized() {
  const isFresh = Date.now() - cachedAuthTime < 55 * 60 * 1000;
  if (!isFresh) {
    await b2.authorize();
    cachedAuthTime = Date.now();
  }
}

// Function to extract metadata from PDF
async function extractPDFMetadata(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    
    return {
      title: title || null,
      authors: author ? [author] : null,
      subject: subject || null,
      keywords: keywords || null,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {
      title: null,
      authors: null,
      subject: null,
      keywords: null,
    };
  }
}

// Create temp directory if it doesn't exist
if (!fs.existsSync("temp")) {
  fs.mkdirSync("temp");
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Endpoint to extract metadata without uploading to B2
app.post("/extract-metadata", tempUpload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (file.mimetype !== "application/pdf") {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    // Extract metadata from the PDF
    const metadata = await extractPDFMetadata(file.path);
    
    // Clean up the temporary file
    fs.unlinkSync(file.path);
    
    // Return metadata
    res.json({
      message: "Metadata extracted successfully",
      metadata: metadata,
    });
  } catch (error) {
    console.error("Metadata extraction failed:", error);
    // Clean up the temporary file if it exists
    if (file && file.path) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: "Metadata extraction failed", details: error.message });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (file.mimetype !== "application/pdf") {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    // Extract metadata from the PDF
    const metadata = await extractPDFMetadata(file.path);

    console.log(metadata)
    
    await ensureAuthorized();

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_BUCKET_ID,
    });

    const fileBuffer = fs.readFileSync(file.path);

    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: file.originalname,
      data: fileBuffer,
      mime: "application/pdf",
    });

    fs.unlinkSync(file.path);

    res.json({
      message: "File uploaded successfully",
      fileId: uploadResponse.data.fileId,
      metadata: metadata,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    fs.unlinkSync(file.path);
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File is too large. Max 15MB allowed." });
  }
  next(err);
});

// RAG API endpoints

// Process a PDF file for RAG
app.post("/process-pdf-for-rag", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { uuid, title, authors } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (file.mimetype !== "application/pdf") {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  if (!uuid) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "UUID is required" });
  }

  try {
    const metadata = {
      title: title || 'Unknown Title',
      authors: authors ? JSON.parse(authors) : [],
    };

    const result = await processPaperForRag(file.path, uuid, metadata);
    
    // Don't delete the file here as it's needed by B2 upload later
    // We'll let the original upload endpoint handle file cleanup
    
    res.json(result);
  } catch (error) {
    console.error("Error processing PDF for RAG:", error);
    // Clean up file on error
    if (file && file.path) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: "Failed to process PDF for RAG", details: error.message });
  }
});

// Generate a response to a query using RAG
app.post("/rag-query", express.json(), async (req, res) => {
  const { uuid, query } = req.body;

  if (!uuid || !query) {
    return res.status(400).json({ error: "UUID and query are required" });
  }

  try {
    const response = await generateRagResponse(uuid, query);
    res.json(response);
  } catch (error) {
    console.error("Error generating RAG response:", error);
    res.status(500).json({ error: "Failed to generate RAG response", details: error.message });
  }
});

// Process text chunks directly for RAG (useful for testing)
app.post("/process-chunks-for-rag", express.json(), async (req, res) => {
  const { uuid, chunks, metadata } = req.body;

  if (!uuid || !chunks || !Array.isArray(chunks)) {
    return res.status(400).json({ error: "UUID and chunks array are required" });
  }

  try {
    const result = await processChunksForRag(chunks, uuid, metadata || {});
    res.json(result);
  } catch (error) {
    console.error("Error processing chunks for RAG:", error);
    res.status(500).json({ error: "Failed to process chunks for RAG", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
