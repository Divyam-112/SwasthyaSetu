import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ArrowLeft, CheckCircle2, Loader2, Building2, Stethoscope, FileText } from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { useSessionStore } from "@/store/sessionStore";
import { useVerificationStore } from "@/store/verificationStore";
import { useCareTeamStore } from "@/store/careTeamStore";
import { sendReportToDoctor } from "@/services/api/reportService";
import { REPORT_SECTIONS } from "@/types/report";

type SendStatus = "idle" | "sending" | "sent";

/**
 * Final step of the "send my report" flow: confirm hospital + doctor,
 * show what's about to be sent, then actually send it. This is
 * distinct from AppointmentBookingPage (a separate, later step) —
 * sharing your history with a doctor and booking a time slot are two
 * different decisions a patient can make independently.
 */
export function SendReportPage() {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const patient = useSessionStore((state) => state.patient);
  const report = useVerificationStore((state) => state.report);
  const selectedHospital = useCareTeamStore((state) => state.selectedHospital);
  const selectedDoctor = useCareTeamStore((state) => state.selectedDoctor);
  const markReportSent = useCareTeamStore((state) => state.markReportSent);

  const [status, setStatus] = useState<SendStatus>("idle");

  useEffect(() => {
    if (!selectedHospital || !selectedDoctor || !report) {
      navigate("/patient/hospitals", { replace: true });
    }
  }, [selectedHospital, selectedDoctor, report, navigate]);

  if (!selectedHospital || !selectedDoctor || !report) return null;

  const sectionSummary = REPORT_SECTIONS.map((section) => ({
    title: section.title,
    count: report[section.key].length,
  })).filter((section) => section.count > 0);

  const chiefComplaint = report.chiefComplaint[0]?.value ?? "Not specified";

  async function handleSend() {
    setStatus("sending");
    const { sentAt } = await sendReportToDoctor(
      patient?.id ?? "unknown-patient",
      doctorId ?? selectedDoctor!.id,
      selectedHospital!.id,
      report!
    );
    markReportSent(sentAt);
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <KioskShell>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Report sent</h1>
          <p className="max-w-md text-base text-ink-muted">
            Your verified medical history has been sent to <strong>{selectedDoctor.name}</strong>{" "}
            at <strong>{selectedHospital.name}</strong>. They'll review it before your
            consultation.
          </p>
          <Button size="kiosk" onClick={() => navigate("/patient/dashboard")}>
            Go to My Records
          </Button>
        </div>
      </KioskShell>
    );
  }

  return (
    <KioskShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Send className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Send Your Report</h1>
          <p className="max-w-lg text-base text-ink-muted">
            Review the details below, then send your verified report to your chosen doctor.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold text-ink">{selectedDoctor.name}</p>
              <p className="text-sm text-ink-muted">{selectedDoctor.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-border pt-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-medium text-ink">{selectedHospital.name}</p>
              <p className="text-sm text-ink-muted">{selectedHospital.address}</p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-ink">What you're sending</h2>
          </div>
          <p className="text-base text-ink">
            <span className="font-medium">Chief complaint:</span> {chiefComplaint}
          </p>
          <ul className="flex flex-wrap gap-2">
            {sectionSummary.map((section) => (
              <li
                key={section.title}
                className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-ink-muted"
              >
                {section.title} ({section.count})
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">
            This is the report you already reviewed and confirmed — patient-confirmed answers and
            document-extracted details are still labeled separately for your doctor.
          </p>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/patient/doctors")}
            disabled={status === "sending"}
          >
            Back
          </Button>
          <Button
            size="kiosk"
            fullWidth
            className="sm:w-auto sm:min-w-[240px]"
            onClick={handleSend}
            disabled={status === "sending"}
            icon={
              status === "sending" ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-5 w-5" aria-hidden="true" />
              )
            }
            aria-busy={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send Report"}
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
