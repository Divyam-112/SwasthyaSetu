import React from "react";

/** Shared section label style for the report and verification
 * screens — uppercase, letter-spaced, quietly clinical rather than
 * shouty, echoing a printed medical-history document. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-border pb-1.5 text-sm font-bold uppercase tracking-wide text-ink-muted">
      {children}
    </h2>
  );
}
