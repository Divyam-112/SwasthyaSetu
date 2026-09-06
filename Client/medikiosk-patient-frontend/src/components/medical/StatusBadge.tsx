import React from "react";
import { Badge } from "@/components/ui";
import type { FieldStatus } from "@/types/report";

const CONFIG: Record<FieldStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  confirmed: { tone: "success", label: "Patient confirmed" },
  "needs-verification": { tone: "warning", label: "Needs verification" },
  edited: { tone: "neutral", label: "Edited by patient" },
};

export function StatusBadge({ status }: { status: FieldStatus }) {
  const { tone, label } = CONFIG[status];
  return <Badge tone={tone}>Status: {label}</Badge>;
}
