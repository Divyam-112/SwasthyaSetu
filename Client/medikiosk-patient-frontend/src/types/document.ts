export type DocumentCategory = "prescription" | "report" | "discharge-summary";
export type DocumentProcessingState = "uploading" | "processing" | "done" | "failed";

export interface UploadedDocument {
  id: string;
  fileName: string;
  category: DocumentCategory;
  fileType: "image" | "pdf";
  fileSizeBytes: number;
  state: DocumentProcessingState;
  /** 0–100, meaningful while state is "uploading". */
  uploadProgress?: number;
  /** Shown once state is "done" — a one-line mock summary of what a
   * real OCR/extraction pipeline would have found. */
  extractionSummary?: string;
  /** Shown when state is "failed". */
  errorMessage?: string;
  /** Local object URL for an image thumbnail — revoked on remove/unmount. */
  previewUrl?: string;
  uploadedAt: string;
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  prescription: "Prescription",
  report: "Medical Report",
  "discharge-summary": "Discharge Summary",
};

/** Mirrors the real SwasthyaSetu backend's upload constraints
 * (multer fileFilter + 15MB limit in document.routes.js) so this
 * mock won't need to change once it's wired to the real endpoint. */
export const ACCEPTED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
