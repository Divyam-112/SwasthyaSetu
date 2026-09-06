import React from "react";
import { KioskShell } from "@/components/layout";
import { ComingNextPlaceholder } from "@/components/feedback/ComingNextPlaceholder";

/** Doctor-side app is out of scope for now — placeholder only. */
export function DoctorRolePlaceholderPage() {
  return (
    <KioskShell>
      <ComingNextPlaceholder
        title="Doctor Portal"
        description="The doctor-side application is being built separately and is not part of this patient frontend."
      />
    </KioskShell>
  );
}
