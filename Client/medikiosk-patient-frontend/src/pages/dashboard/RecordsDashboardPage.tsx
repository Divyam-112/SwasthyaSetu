import React from "react";
import { KioskShell } from "@/components/layout";
import { ComingNextPlaceholder } from "@/components/feedback/ComingNextPlaceholder";

export function RecordsDashboardPage() {
  return (
    <KioskShell>
      <ComingNextPlaceholder
        title="Medical Records"
        description="All prescriptions, lab reports, diagnoses, and visits in one chronological, filterable view. Built next."
      />
    </KioskShell>
  );
}
