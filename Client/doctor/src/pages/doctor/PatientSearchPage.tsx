import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, IdCard, ChevronRight, X } from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Card, Input } from "@/components/ui";
import { mockQueue } from "@/services/mocks/mockQueue";
import { cn } from "@/utils/cn";

export function PatientSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results = q.length < 2
    ? []
    : mockQueue.filter(
        (p) =>
          p.patientName.toLowerCase().includes(q) ||
          p.abhaId.toLowerCase().includes(q) ||
          p.chiefComplaint.toLowerCase().includes(q)
      );

  return (
    <DoctorShell pageTitle="Patient Search">
      <div className="mx-auto max-w-2xl">
        {/* Search input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <input
            type="search"
            className="w-full rounded-md border-2 border-border bg-surface py-3 pl-12 pr-4 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
            placeholder="Search by name, ABHA ID, or complaint…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Empty state */}
        {q.length < 2 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Search className="h-8 w-8" />
            </span>
            <p className="text-lg font-semibold text-ink">Search for a patient</p>
            <p className="max-w-xs text-base text-ink-muted">
              Type at least 2 characters to search by name, ABHA ID, or presenting complaint.
            </p>
          </div>
        )}

        {/* No results */}
        {q.length >= 2 && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-lg font-semibold text-ink">No patients found</p>
            <p className="text-base text-ink-muted">
              No match for "<strong>{query}</strong>" in today's queue.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-sm text-ink-muted">
              {results.length} result{results.length > 1 ? "s" : ""} found
            </p>
            {results.map((patient) => (
              <button
                key={patient.patientId}
                onClick={() =>
                  navigate(`/doctor/patients/${patient.patientId}/report`)
                }
                className="flex w-full items-center justify-between gap-4 rounded-md border border-border bg-surface p-4 text-left shadow-card hover:border-brand transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand flex-shrink-0">
                    {patient.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{patient.patientName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-ink-muted">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {patient.age}y · {patient.gender}
                      </span>
                      <span className="flex items-center gap-1">
                        <IdCard className="h-3.5 w-3.5" />
                        {patient.abhaId}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted line-clamp-1">
                      {patient.chiefComplaint}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink-muted" />
              </button>
            ))}
          </div>
        )}
      </div>
    </DoctorShell>
  );
}
