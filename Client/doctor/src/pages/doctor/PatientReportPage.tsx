import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  IdCard,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileEdit,
  Flag,
  ChevronRight,
  StickyNote,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Badge, Button, Card, Tabs } from "@/components/ui";
import { getMockReport } from "@/services/mocks/mockReports";
import { mockQueue } from "@/services/mocks/mockQueue";
import type { ReportField, ConfidenceLevel } from "@/types/report";
import { cn } from "@/utils/cn";

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "complaint", label: "Chief Complaint" },
  { id: "symptoms", label: "Symptoms" },
  { id: "history", label: "Past History" },
  { id: "medications", label: "Medications" },
  { id: "allergies", label: "Allergies" },
  { id: "investigations", label: "Investigations" },
];

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  if (level === "high")
    return <Badge tone="success">High confidence</Badge>;
  if (level === "medium")
    return <Badge tone="pending">Medium confidence</Badge>;
  return <Badge tone="warning">Low — review needed</Badge>;
}

function FieldRow({ field }: { field: ReportField }) {
  const isLow = field.confidence === "low";
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-md border px-4 py-3",
        isLow
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-surface"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-sm font-medium text-ink-muted">{field.label}</span>
        <ConfidenceBadge level={field.confidence} />
      </div>
      <p className={cn("text-base text-ink", isLow && "font-medium")}>
        {field.value}
      </p>
      <p className="text-xs text-ink-muted capitalize">Source: {field.source.replace("-", " ")}</p>
    </div>
  );
}

function FieldList({ fields, emptyText }: { fields: ReportField[]; emptyText: string }) {
  if (fields.length === 0)
    return <p className="py-8 text-center text-ink-muted">{emptyText}</p>;
  return (
    <div className="flex flex-col gap-3">
      {fields.map((f) => (
        <FieldRow key={f.id} field={f} />
      ))}
    </div>
  );
}

export function PatientReportPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("summary");
  const [doctorNote, setDoctorNote] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const patient = mockQueue.find((p) => p.patientId === patientId);
  const report = getMockReport(patientId ?? "");

  if (!patient) {
    return (
      <DoctorShell pageTitle="Patient Report">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg text-ink-muted">Patient not found in today's queue.</p>
          <Link to="/doctor/dashboard" className="text-brand underline">
            ← Back to Queue
          </Link>
        </div>
      </DoctorShell>
    );
  }

  const lowCount = report
    ? Object.values(report)
        .flat()
        .filter((f: ReportField) => f.confidence === "low").length
    : 0;

  function renderTabContent() {
    if (!report) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Info className="h-10 w-10 text-ink-muted" />
          <p className="text-ink-muted">
            No AI report is available for this patient yet. The report is
            generated after the patient completes the kiosk interview.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "summary":
        return (
          <div className="flex flex-col gap-4">
            {lowCount > 0 && (
              <div className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/5 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-accent">
                    {lowCount} field{lowCount > 1 ? "s" : ""} need{lowCount === 1 ? "s" : ""} your attention
                  </p>
                  <p className="text-sm text-ink-muted">
                    Low-confidence fields are highlighted in amber. Please verify
                    them with the patient before prescribing.
                  </p>
                </div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryCard title="Chief Complaint" fields={report.chiefComplaint} />
              <SummaryCard title="Symptoms" fields={report.symptoms} />
              <SummaryCard title="Past History" fields={report.pastMedicalHistory} />
              <SummaryCard title="Medications" fields={report.medications} />
              <SummaryCard title="Allergies" fields={report.allergies} />
              <SummaryCard title="Investigations" fields={report.previousInvestigations} />
            </div>
          </div>
        );
      case "complaint":
        return <FieldList fields={report.chiefComplaint} emptyText="No chief complaint data." />;
      case "symptoms":
        return <FieldList fields={report.symptoms} emptyText="No symptoms recorded." />;
      case "history":
        return <FieldList fields={report.pastMedicalHistory} emptyText="No past medical history." />;
      case "medications":
        return <FieldList fields={report.medications} emptyText="No medications listed." />;
      case "allergies":
        return <FieldList fields={report.allergies} emptyText="No allergies on record." />;
      case "investigations":
        return <FieldList fields={report.previousInvestigations} emptyText="No prior investigations." />;
      default:
        return null;
    }
  }

  return (
    <DoctorShell pageTitle="Patient Report">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Queue
      </button>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Main report area */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Patient header card */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand font-semibold text-lg flex-shrink-0">
                  {patient.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">{patient.patientName}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" aria-hidden="true" />
                      {patient.age}y · {patient.gender}
                    </span>
                    <span className="flex items-center gap-1">
                      <IdCard className="h-4 w-4" aria-hidden="true" />
                      {patient.abhaId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {patient.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">Queue #{patient.queueNo}</span>
                {report ? (
                  lowCount > 0 ? (
                    <Badge tone="warning">Needs Review</Badge>
                  ) : (
                    <Badge tone="success">Verified</Badge>
                  )
                ) : (
                  <Badge tone="pending">No Report Yet</Badge>
                )}
              </div>
            </div>

            {/* Chief complaint summary */}
            <div className="mt-4 rounded-md border border-border bg-bg px-4 py-3">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">
                Presenting Complaint
              </p>
              <p className="text-base text-ink">{patient.chiefComplaint}</p>
            </div>
          </Card>

          {/* Tabs + report fields */}
          <Card noPadding>
            <div className="px-5 pt-4">
              <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
            </div>
            <div className="p-5">{renderTabContent()}</div>
          </Card>
        </div>

        {/* Doctor action panel — sticky sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
          {/* Status */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-ink">Doctor Actions</h3>

            {accepted ? (
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="h-5 w-5" />
                Report accepted
              </div>
            ) : (
              <Button
                fullWidth
                onClick={() => setAccepted(true)}
                icon={<CheckCircle2 className="h-5 w-5" />}
              >
                Accept Report
              </Button>
            )}

            <button
              onClick={() => setFlagged((f) => !f)}
              className={cn(
                "mt-2 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors",
                flagged
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border text-ink-muted hover:border-accent hover:text-accent"
              )}
            >
              <Flag className="h-4 w-4" />
              {flagged ? "Flagged for Review" : "Flag for Review"}
            </button>
          </Card>

          {/* Doctor's notes */}
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Doctor's Notes</h3>
            </div>
            <textarea
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none resize-none"
              rows={5}
              placeholder="Add consultation notes, observations, or amendments here…"
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
            />
            <p className="mt-1 text-xs text-ink-muted">Notes are saved locally in this session.</p>
          </Card>

          {/* Write Prescription */}
          <Button
            variant="primary"
            fullWidth
            icon={<FileEdit className="h-5 w-5" />}
            onClick={() => navigate(`/doctor/patients/${patientId}/prescribe`)}
          >
            Write Prescription
          </Button>

          {/* Low confidence summary */}
          {lowCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <p className="text-accent">
                <strong>{lowCount} field{lowCount > 1 ? "s" : ""}</strong> flagged as low confidence. Verify before prescribing.
              </p>
            </div>
          )}
        </aside>
      </div>
    </DoctorShell>
  );
}

function SummaryCard({
  title,
  fields,
}: {
  title: string;
  fields: ReportField[];
}) {
  const hasLow = fields.some((f) => f.confidence === "low");
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        {hasLow && <AlertTriangle className="h-4 w-4 text-accent" aria-label="Contains uncertain fields" />}
      </div>
      {fields.length === 0 ? (
        <p className="text-sm text-ink-muted">No data.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {fields.slice(0, 3).map((f) => (
            <li key={f.id} className="flex items-start gap-1.5 text-sm">
              {f.confidence === "low" ? (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" aria-hidden="true" />
              ) : f.confidence === "high" ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" aria-hidden="true" />
              ) : (
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink-muted" aria-hidden="true" />
              )}
              <span className="text-ink line-clamp-1">{f.value}</span>
            </li>
          ))}
          {fields.length > 3 && (
            <li className="text-xs text-ink-muted">+{fields.length - 3} more</li>
          )}
        </ul>
      )}
    </div>
  );
}
