import React from "react";
import { FileText, Image as ImageIcon, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui";
import type { UploadedDocument } from "@/types/document";
import { formatFileSize } from "@/utils/formatFileSize";

interface DocumentListItemProps {
  document: UploadedDocument;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export function DocumentListItem({ document, onRemove, onRetry }: DocumentListItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-md border border-border bg-surface p-4">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-bg">
        {document.previewUrl ? (
          <img src={document.previewUrl} alt="" className="h-full w-full object-cover" />
        ) : document.fileType === "pdf" ? (
          <FileText className="h-7 w-7 text-ink-muted" aria-hidden="true" />
        ) : (
          <ImageIcon className="h-7 w-7 text-ink-muted" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink">{document.fileName}</p>
        <p className="text-sm text-ink-muted">{formatFileSize(document.fileSizeBytes)}</p>

        <div className="mt-2 flex flex-col items-start gap-1.5">
          {document.state === "uploading" && <Badge tone="pending">Uploading…</Badge>}
          {document.state === "processing" && <Badge tone="pending">Processing…</Badge>}

          {document.state === "done" && (
            <>
              <Badge tone="success">Extracted successfully</Badge>
              {document.extractionSummary && (
                <p className="text-sm text-ink-muted">{document.extractionSummary}</p>
              )}
            </>
          )}

          {document.state === "failed" && (
            <>
              <Badge tone="error">Couldn't process this file</Badge>
              {document.errorMessage && (
                <p className="text-sm text-error">{document.errorMessage}</p>
              )}
              <button
                type="button"
                onClick={() => onRetry(document.id)}
                className="inline-flex min-h-tap items-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(document.id)}
        aria-label={`Remove ${document.fileName}`}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-bg hover:text-error"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
