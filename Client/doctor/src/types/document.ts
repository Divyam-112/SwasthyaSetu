export type DocumentCategory = "prescription" | "report" | "discharge-summary";
export type DocumentProcessingState = "uploading" | "processing" | "done" | "failed";

export interface UploadedDocument {
  id: string;
  fileName: string;
  category: DocumentCategory;
  fileType: "image" | "pdf";
  state: DocumentProcessingState;
  uploadedAt: string;
}
