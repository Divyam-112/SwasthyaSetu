import React, { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui";
import { ConfidenceBadge } from "@/components/medical/ConfidenceBadge";
import { StatusBadge } from "@/components/medical/StatusBadge";
import { AbnormalTag } from "@/components/medical/AbnormalTag";
import { cn } from "@/utils/cn";
import type { ReportField } from "@/types/report";

interface EditableReportFieldRowProps {
  field: ReportField;
  onSave: (value: string) => void;
}

/**
 * The verification-screen version of ReportFieldRow: same value +
 * provenance display (including the abnormal-finding flag), plus an
 * edit affordance. Saving a correction is itself how the patient
 * "verifies" a field — see verificationStore.updateField, which
 * re-sources the field to "patient-edited" and flips its status to
 * confirmed.
 */
export function EditableReportFieldRow({ field, onSave }: EditableReportFieldRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);

  function startEdit() {
    setDraft(field.value);
    setIsEditing(true);
  }

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== field.value) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(field.value);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li className="flex flex-col gap-3 rounded-md border-2 border-brand bg-surface p-3">
        <label className="sr-only" htmlFor={`edit-${field.id}`}>
          {field.label}
        </label>
        <input
          id={`edit-${field.id}`}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full min-h-tap rounded-md border-2 border-border bg-surface px-3 text-base text-ink focus:border-brand focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            icon={<X className="h-4 w-4" aria-hidden="true" />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button icon={<Check className="h-4 w-4" aria-hidden="true" />} onClick={handleSave}>
            Save
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3",
        field.isAbnormal
          ? "border-error/40 border-l-4 bg-error/5"
          : "border-border bg-surface"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base text-ink">{field.value}</p>
        <button
          onClick={startEdit}
          aria-label={`Edit ${field.label}`}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-bg hover:text-brand"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <span>
          <span className="font-semibold text-ink">Source:</span> {field.sourceLabel}
        </span>
        <ConfidenceBadge confidence={field.confidence} />
        <StatusBadge status={field.status} />
        {field.isAbnormal && <AbnormalTag />}
      </div>
    </li>
  );
}
