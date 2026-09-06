import React from "react";
import { KioskShell } from "@/components/layout";
import { ComingNextPlaceholder } from "@/components/feedback/ComingNextPlaceholder";

export function PrescriptionPage() {
  return (
    <KioskShell>
      <ComingNextPlaceholder
        title="Prescription"
        description="View the treatment document after a consultation, with a Pending/Received/Reviewed status. Built next."
      />
    </KioskShell>
  );
}
