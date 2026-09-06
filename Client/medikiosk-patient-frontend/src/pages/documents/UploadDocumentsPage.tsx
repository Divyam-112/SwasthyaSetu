import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileUp, AlertCircle } from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card, Tabs } from "@/components/ui";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useDocumentStore } from "@/store/documentStore";
import { processDocument } from "@/services/api/documentService";
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
  type UploadedDocument,
} from "@/types/document";
import { UploadDropzone } from "./components/UploadDropzone";
import { DocumentListItem } from "./components/DocumentListItem";

const CATEGORY_TABS: { id: DocumentCategory; label: string }[] = [
  { id: "prescription", label: "Prescriptions" },
  { id: "report", label: "Medical Reports" },
  { id: "discharge-summary", label: "Discharge Summaries" },
];

/**
 * MOCK document upload. Every file goes through a simulated
 * upload → processing → done/failed pipeline in
 * services/api/documentService.ts — that's the one file a real OCR
 * backend connects to later.
 */
export function UploadDocumentsPage() {
  const navigate = useNavigate();
  const { documents, addDocument, updateDocument, removeDocument } = useDocumentStore();

  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("prescription");
  const [validationError, setValidationError] = useState<string | null>(null);
  const cancelFnsRef = useRef(new Map<string, () => void>());

  const documentsForActiveCategory = documents.filter(
    (doc) => doc.category === activeCategory
  );
  const totalDocuments = documents.length;
  const isAnyDocumentBusy = documents.some(
    (doc) => doc.state === "uploading" || doc.state === "processing"
  );

  function validateFile(file: File): string | null {
    if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
      return `${file.name} isn't a supported file type. Please upload a JPG, PNG, WEBP, or PDF.`;
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return `${file.name} is larger than 15MB. Please upload a smaller file.`;
    }
    return null;
  }

  function startUpload(file: File, category: DocumentCategory) {
    const id = crypto.randomUUID();
    const fileType: UploadedDocument["fileType"] =
      file.type === "application/pdf" ? "pdf" : "image";
    const previewUrl = fileType === "image" ? URL.createObjectURL(file) : undefined;

    addDocument({
      id,
      fileName: file.name,
      category,
      fileType,
      fileSizeBytes: file.size,
      state: "uploading",
      previewUrl,
      uploadedAt: new Date().toISOString(),
    });

    const cancel = processDocument({
      fileName: file.name,
      category,
      onUpdate: (update) => updateDocument(id, update),
    });
    cancelFnsRef.current.set(id, cancel);
  }

  function handleFilesSelected(files: File[]) {
    setValidationError(null);
    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }
      startUpload(file, activeCategory);
    });
  }

  function handleRemove(id: string) {
    const doc = documents.find((d) => d.id === id);
    cancelFnsRef.current.get(id)?.();
    cancelFnsRef.current.delete(id);
    if (doc?.previewUrl) URL.revokeObjectURL(doc.previewUrl);
    removeDocument(id);
  }

  function handleRetry(id: string) {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    updateDocument(id, { state: "uploading", errorMessage: undefined });
    const cancel = processDocument({
      fileName: doc.fileName,
      category: doc.category,
      onUpdate: (update) => updateDocument(id, update),
    });
    cancelFnsRef.current.set(id, cancel);
  }

  function handleBack() {
    navigate("/patient/interview");
  }

  function handleContinue() {
    navigate("/patient/report");
  }

  return (
    <KioskShell steps={ONBOARDING_STEPS} currentStepId="documents">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <FileUp className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Upload Documents</h1>
          <p className="max-w-lg text-base text-ink-muted">
            Add any prescriptions, lab reports, or discharge summaries you have
            with you. This step is optional — skip it if you don't have any.
          </p>
        </div>

        <Card className="flex flex-col gap-6">
          <Tabs
            tabs={CATEGORY_TABS}
            activeId={activeCategory}
            onChange={(id) => setActiveCategory(id as DocumentCategory)}
          />

          <UploadDropzone onFilesSelected={handleFilesSelected} />

          {validationError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          {documentsForActiveCategory.length > 0 ? (
            <div className="flex flex-col gap-3">
              {documentsForActiveCategory.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  document={doc}
                  onRemove={handleRemove}
                  onRetry={handleRetry}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-base text-ink-muted">
              No {DOCUMENT_CATEGORY_LABELS[activeCategory].toLowerCase()} uploaded yet.
            </p>
          )}
        </Card>

        {totalDocuments > 0 && (
          <p className="text-center text-sm text-ink-muted">
            {totalDocuments} file{totalDocuments === 1 ? "" : "s"} uploaded across all
            categories
            {isAnyDocumentBusy ? " — please wait for processing to finish." : "."}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            size="kiosk"
            fullWidth
            className="sm:w-auto sm:min-w-[240px]"
            disabled={isAnyDocumentBusy}
            onClick={handleContinue}
          >
            {totalDocuments === 0 ? "Skip this step" : "Continue"}
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
