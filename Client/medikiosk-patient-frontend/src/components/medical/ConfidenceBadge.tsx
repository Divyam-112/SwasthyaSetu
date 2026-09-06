import React from "react";
import { Badge } from "@/components/ui";
import type { ConfidenceLevel } from "@/types/report";

/** Maps AI confidence straight onto the app's existing status-color
 * language (success/warning/error) rather than inventing a new one —
 * "medium confidence" is exactly the kind of "needs attention" the
 * accent/warning color is reserved for. */
const CONFIG: Record<ConfidenceLevel, { tone: "success" | "warning" | "error"; label: string }> = {
  high: { tone: "success", label: "High" },
  medium: { tone: "warning", label: "Medium" },
  low: { tone: "error", label: "Low" },
};

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const { tone, label } = CONFIG[confidence];
  return <Badge tone={tone}>Confidence: {label}</Badge>;
}
