// TODO: replace mock implementation with real FastAPI/backend calls.
// Keep the exported function names and shapes stable — the Upload
// Documents page depends on these signatures, not on how they're
// implemented.
import { generateMockExtractionSummary } from "@/services/mocks/mockDocuments";
import type { DocumentCategory, DocumentProcessingState } from "@/types/document";

export interface DocumentProcessingUpdate {
  state: DocumentProcessingState;
  extractionSummary?: string;
  errorMessage?: string;
}

export interface ProcessDocumentOptions {
  fileName: string;
  category: DocumentCategory;
  onUpdate: (update: DocumentProcessingUpdate) => void;
}

const UPLOAD_MS = 700;
const PROCESSING_MS = 1500;
// Just enough to occasionally demo the failed/retry state — not meant
// to model any real OCR failure rate.
const MOCK_FAILURE_RATE = 0.12;

/**
 * Simulates the pipeline a real document-extraction backend runs:
 * upload → processing (OCR/data extraction) → done or failed.
 * Callers never see a network call — only state updates delivered to
 * onUpdate over time.
 *
 * To connect the real backend later, this is the ONE function to
 * rewrite: POST the file to `/api/documents/upload` (see the
 * SwasthyaSetu backend's document.routes.js), then trigger
 * `/api/documents/process/:docId` and either poll it or listen for a
 * socket.io event, calling onUpdate as real state comes in. Nothing
 * in UploadDocumentsPage or documentStore needs to change.
 *
 * Returns a cancel function — call it to stop pending updates (e.g.
 * the patient removed the file before processing finished).
 */
export function processDocument({
  fileName,
  category,
  onUpdate,
}: ProcessDocumentOptions): () => void {
  let uploadTimer: ReturnType<typeof setTimeout> | null = null;
  let processTimer: ReturnType<typeof setTimeout> | null = null;

  uploadTimer = setTimeout(() => {
    uploadTimer = null;
    onUpdate({ state: "processing" });

    processTimer = setTimeout(() => {
      processTimer = null;
      const didFail = Math.random() < MOCK_FAILURE_RATE;
      onUpdate(
        didFail
          ? {
              state: "failed",
              errorMessage:
                "We couldn't read this file clearly. Please try again or upload a clearer copy.",
            }
          : {
              state: "done",
              extractionSummary: generateMockExtractionSummary(category, fileName),
            }
      );
    }, PROCESSING_MS);
  }, UPLOAD_MS);

  return () => {
    if (uploadTimer) clearTimeout(uploadTimer);
    if (processTimer) clearTimeout(processTimer);
  };
}
