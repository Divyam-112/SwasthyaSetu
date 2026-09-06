import React from "react";
import { KioskShell } from "@/components/layout";
import { ComingNextPlaceholder } from "@/components/feedback/ComingNextPlaceholder";

export function AppointmentBookingPage() {
  return (
    <KioskShell>
      <ComingNextPlaceholder
        title="Book an Appointment"
        description="Choose an available slot with the selected doctor. Built next."
      />
    </KioskShell>
  );
}
