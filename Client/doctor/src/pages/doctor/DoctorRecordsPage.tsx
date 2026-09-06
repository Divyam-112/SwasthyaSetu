import React from "react";
import { FileText } from "lucide-react";
import { DoctorShell } from "@/components/layout";

export function DoctorRecordsPage() {
  return (
    <DoctorShell pageTitle="Patient Records">
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <FileText className="h-8 w-8" />
        </span>
        <h2 className="text-xl font-semibold text-ink">Records</h2>
        <p className="max-w-sm text-base text-ink-muted">
          Full patient record history across visits will be accessible here once
          the ABDM records API is connected.
        </p>
      </div>
    </DoctorShell>
  );
}
