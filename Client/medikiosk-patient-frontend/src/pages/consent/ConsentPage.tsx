import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Target,
  ScanText,
  Eye,
  Stethoscope,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { KioskShell, ReadAloudButton } from "@/components/layout";
import { Button, Card, Checkbox } from "@/components/ui";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useSessionStore } from "@/store/sessionStore";
import { recordConsent } from "@/services/api/consentService";

interface ConsentSection {
  icon: React.ElementType;
  title: string;
  description: string;
}

const CONSENT_SECTIONS: ConsentSection[] = [
  {
    icon: ClipboardList,
    title: "What we collect",
    description:
      "Your name, age, and ABHA ID; your spoken answers during the health interview; and any medical documents you upload, such as prescriptions or lab reports.",
  },
  {
    icon: Target,
    title: "Why we collect it",
    description:
      "To prepare an accurate health history for your doctor, so you don't have to repeat everything in person, and so your visit goes faster.",
  },
  {
    icon: ScanText,
    title: "How your documents are used",
    description:
      "Any prescriptions or reports you upload are read by the software to pull out relevant details — like medicines or past diagnoses — and added to your history.",
  },
  {
    icon: Eye,
    title: "You review before it's final",
    description:
      "Before anything is shared, you'll see the full history MediKiosk has put together and can correct or remove anything that's wrong.",
  },
  {
    icon: Stethoscope,
    title: "Your doctor makes the decision",
    description:
      "MediKiosk only organizes information for your visit. It does not diagnose or prescribe — your doctor reviews everything and makes all medical decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Your privacy",
    description:
      "Your information is processed securely and only used for your care. Temporary session data is cleared right after you submit. You can withdraw this consent at any time by asking the front desk.",
  },
];

const EXPLAINER_TEXT =
  "Before we continue, here's what MediKiosk does with your information. " +
  CONSENT_SECTIONS.map((section) => `${section.title}. ${section.description}`).join(" ");

type SubmitStatus = "idle" | "loading";

export function ConsentPage() {
  const navigate = useNavigate();
  const patient = useSessionStore((state) => state.patient);
  const setConsented = useSessionStore((state) => state.setConsented);

  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleContinue() {
    if (!checked || status === "loading") return;

    setStatus("loading");
    // patient should always be set by this point (post login/signup), but
    // fall back gracefully rather than throwing if the store is empty.
    await recordConsent(patient?.id ?? "unknown-patient");
    setConsented(true);
    navigate("/patient/interview");
  }

  function handleBack() {
    navigate("/patient/login");
  }

  return (
    <KioskShell steps={ONBOARDING_STEPS} currentStepId="consent">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Your consent</h1>
          <p className="max-w-lg text-base text-ink-muted">
            {patient?.name ? `${patient.name.split(" ")[0]}, before` : "Before"} we begin, please
            read what MediKiosk does with your information.
          </p>
          <ReadAloudButton text={EXPLAINER_TEXT} />
        </div>

        <Card noPadding className="divide-y divide-border">
          {CONSENT_SECTIONS.map((section) => (
            <div key={section.title} className="flex gap-4 p-5">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <section.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
                <p className="mt-1 text-base text-ink-muted">{section.description}</p>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            label="I understand and consent to continue."
            description="You can ask staff to explain any part of this again, in your language."
          />
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={handleBack}
            disabled={status === "loading"}
          >
            Back
          </Button>
          <Button
            size="kiosk"
            fullWidth
            className="sm:w-auto sm:min-w-[240px]"
            disabled={!checked || status === "loading"}
            onClick={handleContinue}
            icon={
              status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : undefined
            }
            aria-busy={status === "loading"}
          >
            {status === "loading" ? "Saving your consent…" : "Continue"}
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
