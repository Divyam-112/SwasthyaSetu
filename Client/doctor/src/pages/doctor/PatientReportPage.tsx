import React, { useState, useEffect } from "react";
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
  Loader2,
  StickyNote,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Badge, Button, Card, Tabs } from "@/components/ui";
import {
  fetchPatientDetail,
  submitReview,
  type PatientDetail,
} from "@/services/api/doctorService";
import { cn } from "@/utils/cn";

const TABS = [
  { id: "summary", label: "AI Summary" },
  { id: "history", label: "Clinical History" },
  { id: "ayush", label: "AYUSH Assessment" },
];

export function PatientReportPage() {
  const { patientId: sessionId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("summary");
  const [doctorNote, setDoctorNote] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPatientDetail(sessionId!);
        setSession(data);

        // Check if already reviewed
        if (data.doctorReview?.status === "accepted") {
          setAccepted(true);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load patient data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sessionId]);

  async function handleAccept() {
    if (!sessionId) return;
    setReviewLoading(true);
    try {
      await submitReview(sessionId, "accepted", doctorNote);
      setAccepted(true);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) {
    return (
      <DoctorShell pageTitle="Patient Report">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <span className="ml-3 text-ink-muted">
            Loading patient data...
          </span>
        </div>
      </DoctorShell>
    );
  }

  if (error || !session) {
    return (
      <DoctorShell pageTitle="Patient Report">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-accent" />
          <p className="text-lg text-ink-muted">
            {error || "Patient not found."}
          </p>
          <Link
            to="/doctor/dashboard"
            className="text-brand underline"
          >
            ← Back to Queue
          </Link>
        </div>
      </DoctorShell>
    );
  }

  const patient = session.patient;
  const summary = session.clinicalSummary;
  const history = session.clinicalHistory;
  const ayush = session.ayushAssessment;
  const redFlags = summary?.redFlags || [];
  const abnormalValues = summary?.abnormalValues || [];

  function renderTabContent() {
    switch (activeTab) {
      case "summary":
        return (
          <div className="flex flex-col gap-4">
            {/* Red flags alert */}
            {redFlags.length > 0 && (
              <div className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/5 px-4 py-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-accent">
                    {redFlags.length} Red Flag
                    {redFlags.length > 1 ? "s" : ""} Detected
                  </p>
                  <ul className="mt-1 list-disc list-inside text-sm text-ink-muted">
                    {redFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Abnormal values */}
            {abnormalValues.length > 0 && (
              <div className="flex items-start gap-3 rounded-md border border-error/30 bg-error/5 px-4 py-3">
                <Info
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-error"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-error">
                    Abnormal Values
                  </p>
                  <ul className="mt-1 list-disc list-inside text-sm text-ink-muted">
                    {abnormalValues.map((val, i) => (
                      <li key={i}>{val}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* AI Generated Summary */}
            {summary?.generatedText ? (
              <div className="rounded-md border border-border bg-bg p-4">
                <h4 className="mb-2 text-sm font-semibold text-ink-muted uppercase tracking-wide">
                  Clinical Summary (Doctor-facing)
                </h4>
                <p className="text-base text-ink whitespace-pre-wrap leading-relaxed">
                  {summary.generatedText}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Info className="h-10 w-10 text-ink-muted" />
                <p className="text-ink-muted">
                  No AI summary has been generated yet for this
                  session.
                </p>
              </div>
            )}

            {/* Patient-facing summary */}
            {summary?.patientSummary && (
              <div className="rounded-md border border-border bg-bg p-4">
                <h4 className="mb-2 text-sm font-semibold text-ink-muted uppercase tracking-wide">
                  Patient Summary (Local language)
                </h4>
                <p className="text-base text-ink whitespace-pre-wrap leading-relaxed">
                  {summary.patientSummary}
                </p>
              </div>
            )}

            {/* AYUSH Summary */}
            {summary?.ayushSummary && (
              <div className="rounded-md border border-success/30 bg-success/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-success uppercase tracking-wide">
                  AYUSH / Integrative Summary
                </h4>
                <p className="text-base text-ink whitespace-pre-wrap leading-relaxed">
                  {summary.ayushSummary}
                </p>
              </div>
            )}

            {/* Drug interactions */}
            {summary?.drugInteractions &&
              summary.drugInteractions.length > 0 && (
                <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-accent uppercase tracking-wide">
                    Potential Drug Interactions
                  </h4>
                  <ul className="list-disc list-inside text-sm text-ink">
                    {summary.drugInteractions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        );

      case "history":
        return (
          <div className="flex flex-col gap-3">
            {history &&
              Object.entries(history).map(
                ([key, value]) =>
                  value && (
                    <HistoryField
                      key={key}
                      label={formatLabel(key)}
                      value={value as string}
                    />
                  )
              )}
            {(!history ||
              Object.values(history).every((v) => !v)) && (
              <p className="py-8 text-center text-ink-muted">
                No clinical history recorded.
              </p>
            )}
          </div>
        );

      case "ayush":
        return (
          <div className="flex flex-col gap-3">
            {ayush &&
              Object.entries(ayush).map(
                ([key, value]) =>
                  value && (
                    <HistoryField
                      key={key}
                      label={formatLabel(key)}
                      value={value as string}
                    />
                  )
              )}
            {(!ayush ||
              Object.values(ayush).every((v) => !v)) && (
              <p className="py-8 text-center text-ink-muted">
                No AYUSH assessment data. This appears for sessions of type
                "ayush" only.
              </p>
            )}
          </div>
        );

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
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    {patient.name}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    <span className="flex items-center gap-1">
                      <User
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      {patient.age ? `${patient.age}y` : ""}
                      {patient.gender
                        ? ` · ${patient.gender}`
                        : ""}
                    </span>
                    {patient.abhaId && (
                      <span className="flex items-center gap-1">
                        <IdCard
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        {patient.abhaId}
                      </span>
                    )}
                    {patient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">
                  {session.sessionType}
                </span>
                {redFlags.length > 0 ? (
                  <Badge tone="warning">Red Flags</Badge>
                ) : summary?.generatedText ? (
                  <Badge tone="success">Summary Ready</Badge>
                ) : (
                  <Badge tone="pending">No Summary</Badge>
                )}
              </div>
            </div>

            {/* Chief complaint */}
            {history?.chiefComplaint && (
              <div className="mt-4 rounded-md border border-border bg-bg px-4 py-3">
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">
                  Presenting Complaint
                </p>
                <p className="text-base text-ink">
                  {history.chiefComplaint}
                </p>
              </div>
            )}
          </Card>

          {/* Tabs + content */}
          <Card noPadding>
            <div className="px-5 pt-4">
              <Tabs
                tabs={TABS}
                activeId={activeTab}
                onChange={setActiveTab}
              />
            </div>
            <div className="p-5">{renderTabContent()}</div>
          </Card>
        </div>

        {/* Doctor action panel — sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
          {/* Accept / Review */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-ink">
              Doctor Actions
            </h3>

            {accepted ? (
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="h-5 w-5" />
                Report accepted
              </div>
            ) : (
              <Button
                fullWidth
                onClick={handleAccept}
                disabled={reviewLoading}
                icon={
                  reviewLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )
                }
              >
                {reviewLoading ? "Saving..." : "Accept Report"}
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
              <h3 className="text-sm font-semibold text-ink">
                Doctor's Notes
              </h3>
            </div>
            <textarea
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none resize-none"
              rows={5}
              placeholder="Add consultation notes, observations, or amendments here…"
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
            />
          </Card>

          {/* Write Prescription */}
          <Button
            variant="primary"
            fullWidth
            icon={<FileEdit className="h-5 w-5" />}
            onClick={() =>
              navigate(
                `/doctor/patients/${sessionId}/prescribe`
              )
            }
          >
            Write Prescription
          </Button>

          {/* Red flags summary */}
          {redFlags.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <p className="text-accent">
                <strong>
                  {redFlags.length} red flag
                  {redFlags.length > 1 ? "s" : ""}
                </strong>{" "}
                detected. Verify before prescribing.
              </p>
            </div>
          )}
        </aside>
      </div>
    </DoctorShell>
  );
}

/** Format camelCase key to human-readable label */
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function HistoryField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface px-4 py-3">
      <p className="text-sm font-medium text-ink-muted mb-1">
        {label}
      </p>
      <p className="text-base text-ink whitespace-pre-wrap">{value}</p>
    </div>
  );
}
