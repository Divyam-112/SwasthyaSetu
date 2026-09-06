import React, { useRef, useState } from "react";
import { UploadCloud, FolderOpen, Camera } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/cn";
import { ACCEPTED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/types/document";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

const MAX_SIZE_MB = Math.round(MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024));

/**
 * "Take a photo" isn't mocked — `capture="environment"` on a file
 * input genuinely opens the device camera on phones/tablets (and
 * falls back to a normal file picker on desktop). Nothing to fake
 * here; only what happens to the resulting file afterward is mocked.
 */
export function UploadDropzone({ onFilesSelected }: UploadDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files?.length) {
      onFilesSelected(Array.from(event.dataTransfer.files));
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      onFilesSelected(Array.from(event.target.files));
    }
    // Reset so choosing the exact same file again still fires onChange.
    event.target.value = "";
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDraggingOver ? "border-brand bg-brand/5" : "border-border bg-surface"
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <UploadCloud className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <p className="text-lg font-semibold text-ink">Drag and drop a file here</p>
        <p className="mt-1 text-base text-ink-muted">
          or choose a file, or take a photo of the document
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          variant="secondary"
          icon={<FolderOpen className="h-5 w-5" aria-hidden="true" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose file
        </Button>
        <Button
          type="button"
          variant="secondary"
          icon={<Camera className="h-5 w-5" aria-hidden="true" />}
          onClick={() => cameraInputRef.current?.click()}
        >
          Take a photo
        </Button>
      </div>

      <p className="text-sm text-ink-muted">
        Accepted: JPG, PNG, WEBP, or PDF · Up to {MAX_SIZE_MB}MB per file
      </p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_DOCUMENT_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
