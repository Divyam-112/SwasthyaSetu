import React from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface InterviewCompletionProps {
  answeredCount: number;
  skippedCount: number;
  isSaving: boolean;
  saveError: string | null;
  onContinue: () => void;
}

export function InterviewCompletion({
  answeredCount,
  skippedCount,
  isSaving,
  saveError,
  onContinue,
}: InterviewCompletionProps) {
  return (
    <Card className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-ink">That's everything for now</h1>
        <p className="mt-2 max-w-md text-base text-ink-muted">
          Thank you for answering {answeredCount} question{answeredCount === 1 ? "" : "s"}
          {skippedCount > 0
            ? ` (you skipped ${skippedCount})`
            : ""}
          . Your doctor will see this along with anything you upload next.
        </p>
      </div>

      {saveError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-left text-sm text-error"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{saveError}</span>
        </div>
      )}

      <Button
        size="kiosk"
        onClick={onContinue}
        disabled={isSaving}
        icon={isSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : undefined}
        aria-busy={isSaving}
      >
        {isSaving ? "Saving your answers…" : "Continue to upload documents"}
      </Button>
    </Card>
  );
}
