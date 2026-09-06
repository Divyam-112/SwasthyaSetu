import type { DocumentCategory } from "@/types/document";

/**
 * Canned "what OCR found" lines, standing in for a real
 * extraction/OCR pipeline (see the SwasthyaSetu backend's
 * ML_SERVICE_URL, which isn't built yet either). Picking by filename
 * length just keeps the same file producing the same mock result
 * across a demo, without needing any real analysis.
 */
const SUMMARIES_BY_CATEGORY: Record<DocumentCategory, string[]> = {
  prescription: [
    "Found 2 medicines: Amoxicillin 500mg, Paracetamol 650mg",
    "Found 1 medicine: Metformin 500mg, twice daily",
    "Found 3 medicines with dosage instructions",
  ],
  report: [
    "Found lab results: Hemoglobin, Fasting Blood Sugar",
    "Found lab results: Complete Blood Count, 6 values",
    "Found imaging report: Chest X-ray findings",
  ],
  "discharge-summary": [
    "Found diagnosis and 4 days of admission notes",
    "Found discharge diagnosis, procedure, and follow-up advice",
  ],
};

export function generateMockExtractionSummary(
  category: DocumentCategory,
  fileName: string
): string {
  const options = SUMMARIES_BY_CATEGORY[category];
  const index = fileName.length % options.length;
  return options[index];
}
