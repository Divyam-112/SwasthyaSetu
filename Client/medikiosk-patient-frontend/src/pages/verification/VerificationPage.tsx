import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { KioskShell, ReadAloudButton } from "@/components/layout";
import { Button, Card, Checkbox } from "@/components/ui";
import { SectionHeading } from "@/components/medical/SectionHeading";
import { EditableReportFieldRow } from "./components/EditableReportFieldRow";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useSessionStore } from "@/store/sessionStore";
import { useVerificationStore } from "@/store/verificationStore";
import { confirmReport } from "@/services/api/reportService";
import { REPORT_SECTIONS } from "@/types/report";

const EXPLAINER_TEXT =
  "Please look over every section below. If anything is wrong or missing, tap the pencil icon to fix it. Once everything looks correct, confirm at the bottom to send this to your doctor.";

type SubmitStatus = "idle" | "loading";

export function VerificationPage() {
  const navigate = useNavigate();
  const patient = useSessionStore((state) => state.patient);
  const report = useVerificationStore((state) => state.report);
  const updateField = useVerificationStore((state) => state.updateField);
  const markConfirmed = useVerificationStore((state) => state.markConfirmed);

  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useEffect(() => {
    // No report yet (e.g. direct nav, or a refresh cleared memory) —
    // go generate one first rather than showing an empty screen.
    if (!report) navigate("/patient/report", { replace: true });
  }, [report, navigate]);

  const needsVerificationCount = useMemo(() => {
    if (!report) return 0;
    return REPORT_SECTIONS.reduce(
      (count, section) =>
        count + report[section.key].filter((field) => field.status === "needs-verification").length,
      0
    );
  }, [report]);

  if (!report) return null;

  async function handleConfirm() {
    if (!checked || status === "loading") return;
    setStatus("loading");
    const { confirmedAt } = await confirmReport(patient?.id ?? "unknown-patient", report);
    markConfirmed(confirmedAt);
    navigate("/patient/hospitals");
  }

  return (
    <KioskShell steps={ONBOARDING_STEPS} currentStepId="verification">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Confirm Your Details</h1>
          <p className="max-w-lg text-base text-ink-muted">{EXPLAINER_TEXT}</p>
          <ReadAloudButton text={EXPLAINER_TEXT} />
        </div>

        {needsVerificationCount > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
            <span>
              {needsVerificationCount} item{needsVerificationCount === 1 ? "" : "s"} extracted from
              your documents still need{needsVerificationCount === 1 ? "s" : ""} a quick check —
              look for the <strong>Needs verification</strong> label below.
            </span>
          </div>
        )}

        <Card noPadding className="overflow-hidden">
          <div className="flex flex-col gap-6 p-6">
            <section>
              <SectionHeading>Patient</SectionHeading>
              <p className="text-lg font-semibold text-ink">{report.patient.name}</p>
              <p className="text-sm text-ink-muted">Age: {report.patient.age}</p>
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
                        <EditableReportFieldRow
                          key={field.id}
                          field={field}
                          onSave={(value) => updateField(section.key, field.id, value)}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </Card>

        <Card>
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            label="I have reviewed all the details above and confirm they are correct."
            description="Your doctor will still review everything before making any decisions."
          />
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/patient/report")}
            disabled={status === "loading"}
          >
            Back
          </Button>
          <Button
            size="kiosk"
            fullWidth
            className="sm:w-auto sm:min-w-[240px]"
            disabled={!checked || status === "loading"}
            onClick={handleConfirm}
            icon={
              status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : undefined
            }
            aria-busy={status === "loading"}
          >
            {status === "loading" ? "Submitting…" : "Confirm & Continue"}
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
