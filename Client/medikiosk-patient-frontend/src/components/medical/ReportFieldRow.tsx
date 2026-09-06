import React from "react";
import type { ReportField } from "@/types/report";
import { cn } from "@/utils/cn";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { StatusBadge } from "./StatusBadge";
import { AbnormalTag } from "./AbnormalTag";

/** Read-only display of one report field, with its full provenance
 * (source / confidence / status) shown right under the value — the
 * point being a doctor (or the patient) never has to wonder whether
 * a line was self-reported or machine-extracted. A clinically notable
 * finding gets a left accent border and an "Abnormal finding" tag,
 * but still shows the same source information as every other field. */
export function ReportFieldRow({ field }: { field: ReportField }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3",
        field.isAbnormal
          ? "border-error/40 border-l-4 bg-error/5"
          : "border-border bg-surface"
      )}
    >
      <p className="text-base text-ink">{field.value}</p>
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
