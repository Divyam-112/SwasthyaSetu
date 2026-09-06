import React from "react";
import { AlertTriangle } from "lucide-react";

/** Distinct from ConfidenceBadge/StatusBadge — this flags the finding
 * itself as clinically notable, not the AI's certainty about it. Its
 * source is still always visible via the row's normal sourceLabel. */
export function AbnormalTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-error/30 bg-error/10 px-2.5 py-1 text-xs font-medium text-error">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      Abnormal finding
    </span>
  );
}
