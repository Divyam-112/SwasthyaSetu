import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Info, ArrowLeft, ShieldCheck, Loader2, Leaf, Wind } from "lucide-react";
import { KioskShell, ReadAloudButton } from "@/components/layout";
import { Button, Card, Checkbox } from "@/components/ui";
import { SectionHeading } from "@/components/medical/SectionHeading";
import { ReportFieldRow } from "@/components/medical/ReportFieldRow";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useSessionStore } from "@/store/sessionStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useDocumentStore } from "@/store/documentStore";
import { useVerificationStore } from "@/store/verificationStore";
import { generateMockReport } from "@/services/api/reportService";
import { REPORT_SECTIONS } from "@/types/report";
import type { WellnessRecommendation } from "@/types/report";
import { formatPatientDate } from "@/utils/dateFormat";

const EXPLAINER_TEXT =
  "This is a summary of what you told us and what we found in your documents. It is not a diagnosis. Your doctor will review everything before making any decisions. On the next screen you can check it and fix anything that's wrong.";

const WELLNESS_EXPLAINER =
  "These are general, widely-known home remedies and yoga practices based on the symptoms above — not a diagnosis or a prescription. Your doctor will review and check off which ones apply during your consultation.";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function GeneratedReportPage() {
  const navigate = useNavigate();
  const patient = useSessionStore((state) => state.patient);
  const interviewAnswers = useInterviewStore((state) => state.answers);
  const documents = useDocumentStore((state) => state.documents);

  const report = useVerificationStore((state) => state.report);
  const setReport = useVerificationStore((state) => state.setReport);

  const [isGenerating, setIsGenerating] = useState(false);
  const [checkedRecommendations, setCheckedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (report || !patient) return;
    setIsGenerating(true);
    generateMockReport(patient, interviewAnswers, documents)
      .then(setReport)
      .finally(() => setIsGenerating(false));
    // Only ever auto-generate once per session — re-runs would wipe
    // out any edits the patient makes on the verification screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, patient]);

  function handleVerify() {
    navigate("/patient/verification");
  }

  function toggleRecommendation(id: string) {
    setCheckedRecommendations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function renderRecommendation(recommendation: WellnessRecommendation) {
    return (
      <Checkbox
        key={recommendation.id}
        checked={checkedRecommendations.has(recommendation.id)}
        onChange={() => toggleRecommendation(recommendation.id)}
        label={recommendation.text}
        description={`Suggested for: ${recommendation.basedOn}`}
      />
    );
  }

  if (!report) {
    return (
      <KioskShell steps={ONBOARDING_STEPS} currentStepId="report">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
          <p className="text-base text-ink-muted">
            {isGenerating ? "Preparing your report…" : "Loading…"}
          </p>
        </div>
      </KioskShell>
    );
  }

  return (
    <KioskShell steps={ONBOARDING_STEPS} currentStepId="report">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Your Medical History Report</h1>
          <p className="max-w-lg text-base text-ink-muted">{EXPLAINER_TEXT}</p>
          <ReadAloudButton text={EXPLAINER_TEXT} />
        </div>

        <div className="flex items-start gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            This report has not been reviewed by a doctor yet. Please check it carefully on the
            next screen.
          </span>
        </div>

        <Card noPadding className="overflow-hidden">
          <div className="border-b-2 border-border bg-brand/5 px-6 py-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Medical History
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Generated {formatPatientDate(report.generatedAt)}
            </p>
          </div>

          <div className="flex flex-col gap-6 p-6">
            <section>
              <SectionHeading>Patient</SectionHeading>
              <p className="text-lg font-semibold text-ink">{report.patient.name}</p>
              <p className="text-sm text-ink-muted">
                Age: {report.patient.age} • {capitalize(report.patient.gender)} • ABHA:{" "}
                {report.patient.abhaId}
              </p>
            </section>

            {REPORT_SECTIONS.map((section) => {
              const fields = report[section.key];
              return (
                <section key={section.key}>
                  <SectionHeading>{section.title}</SectionHeading>
                  {fields.length === 0 ? (
                    <p className="text-sm italic text-ink-muted">Not provided</p>
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {fields.map((field) => (
                        <ReportFieldRow key={field.id} field={field} />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          <div className="border-t-2 border-border bg-bg px-6 py-4 text-center text-sm text-ink-muted">
            <span className="font-semibold text-ink">Source:</span> {report.sourceSummary}
          </div>
        </Card>

        {/* Separate, visually distinct block — general wellness
            suggestions for the doctor to review and check off, kept
            apart from the clinical history sections above. */}
        <Card noPadding className="overflow-hidden border-success/30">
          <div className="border-b-2 border-success/20 bg-success/5 px-6 py-5 text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-success">
              <Leaf className="h-4 w-4" aria-hidden="true" />
              Suggested Home Remedies &amp; Yoga
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{WELLNESS_EXPLAINER}</p>
          </div>

          <div className="flex flex-col gap-6 p-6">
            <section>
              <SectionHeading>Home Remedies</SectionHeading>
              {report.wellness.homeRemedies.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {report.wellness.homeRemedies.map(renderRecommendation)}
                </div>
              ) : (
                <p className="text-sm italic text-ink-muted">No suggestions generated.</p>
              )}
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-1.5 border-b border-border pb-1.5 text-sm font-bold uppercase tracking-wide text-ink-muted">
                <Wind className="h-4 w-4" aria-hidden="true" />
                Yoga &amp; Breathing Exercises
              </h2>
              {report.wellness.yogaExercises.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {report.wellness.yogaExercises.map(renderRecommendation)}
                </div>
              ) : (
                <p className="text-sm italic text-ink-muted">No suggestions generated.</p>
              )}
            </section>
          </div>

          <div className="border-t-2 border-success/20 bg-success/5 px-6 py-3 text-center text-xs text-ink-muted">
            {checkedRecommendations.size} of{" "}
            {report.wellness.homeRemedies.length + report.wellness.yogaExercises.length} reviewed
            by doctor
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/patient/documents")}
          >
            Back
          </Button>
          <Button
            size="kiosk"
            fullWidth
            className="sm:w-auto sm:min-w-[240px]"
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            onClick={handleVerify}
          >
            Verify Report
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
