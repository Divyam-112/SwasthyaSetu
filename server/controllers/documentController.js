import Session from "../models/Session.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";

/**
 * POST /api/documents/upload
 * Upload a medical document (prescription, lab report, etc.)
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const { sessionId, type } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  if (!req.file) {
    throw new ApiError(400, "Document file is required");
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Upload to Cloudinary
  let imageUrl = "";
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "swasthyasetu/documents",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    imageUrl = result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw new ApiError(500, "Failed to upload document. Please try again.");
  }

  // Add document to session
  const newDoc = {
    type: type || "other",
    imageUrl,
    ocrText: "",
    extractedData: {},
    uploadedAt: new Date(),
  };

  session.scannedDocuments.push(newDoc);
  await session.save();

  // Get the saved document (last one in array)
  const savedDoc = session.scannedDocuments[session.scannedDocuments.length - 1];

  res.status(201).json(
    new ApiResponse(201, {
      docId: savedDoc._id,
      imageUrl,
      status: "uploaded",
      type: type || "other",
    }, "Document uploaded successfully")
  );
});

/**
 * POST /api/documents/process/:docId
 * Trigger OCR processing on an uploaded document.
 * Calls the ML service (teammate's OCR API) to extract data.
 */
export const processDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Find the document in session
  const doc = session.scannedDocuments.id(docId);
  if (!doc) {
    throw new ApiError(404, "Document not found");
  }

  try {
    // Call ML teammate's OCR service
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    const ocrResponse = await axios.post(`${mlServiceUrl}/api/ocr/process`, {
      imageUrl: doc.imageUrl,
    }, { timeout: 30000 }); // 30 second timeout

    const { rawText, extractedData } = ocrResponse.data;

    // Update document with OCR results
    doc.ocrText = rawText || "";
    doc.extractedData = {
      diagnoses: extractedData?.diagnoses || [],
      medications: extractedData?.medications || [],
      labResults: extractedData?.labResults || [],
      procedures: extractedData?.procedures || [],
      doctorName: extractedData?.doctorName || "",
      hospitalName: extractedData?.hospitalName || "",
      date: extractedData?.date ? new Date(extractedData.date) : null,
    };

    await session.save();

    res.status(200).json(
      new ApiResponse(200, {
        docId,
        status: "processed",
        extractedData: doc.extractedData,
        ocrText: doc.ocrText,
      }, "Document processed successfully")
    );
  } catch (error) {
    console.error("OCR Service Error:", error.message);

    // If ML service is down, return a helpful error
    if (error.code === "ECONNREFUSED") {
      throw new ApiError(503, "OCR service is unavailable. Make sure the ML service is running.");
    }
    throw new ApiError(500, "Document processing failed. Please try again.");
  }
});

/**
 * GET /api/documents/:docId
 * Get a specific document with its extracted data
 */
export const getDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const { sessionId } = req.query;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required as query param");
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  const doc = session.scannedDocuments.id(docId);
  if (!doc) {
    throw new ApiError(404, "Document not found");
  }

  res.status(200).json(
    new ApiResponse(200, doc, "Document retrieved successfully")
  );
});

/**
 * GET /api/documents/session/:sessionId
 * Get all documents for a session (timeline view)
 */
export const getSessionDocuments = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId).select("scannedDocuments");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Sort by upload date (newest first)
  const documents = session.scannedDocuments.sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );

  res.status(200).json(
    new ApiResponse(200, documents, "Documents retrieved successfully")
  );
});
