import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Loader2, AlertCircle, IdCard, Lock, Info } from "lucide-react";
import { KioskShell, ReadAloudButton } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useSessionStore } from "@/store/sessionStore";
import { loginWithAbhaId, isValidAbhaIdFormat } from "@/services/api/authService";

const EXPLAINER_TEXT =
  "Your ABHA ID is your digital health identity, issued by the Government of India's Ayushman Bharat Digital Mission. It lets you securely share your health records with doctors, without carrying paper files. MediKiosk uses it only to identify you — your records stay under your control.";

type FormStatus = "idle" | "loading" | "error";

interface FormState {
  abhaId: string;
  password: string;
}

export function AbhaLoginPage() {
  const navigate = useNavigate();
  const setPatient = useSessionStore((state) => state.setPatient);

  const [form, setForm] = useState<FormState>({ abhaId: "", password: "" });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    abhaId: false,
    password: false,
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedId = form.abhaId.trim();
  const abhaIdError = touched.abhaId
    ? trimmedId.length === 0
      ? "Enter your ABHA ID to continue."
      : !isValidAbhaIdFormat(trimmedId)
      ? "Enter a 14-digit ABHA number (e.g. 12-3456-7890-1234) or an ABHA address (e.g. name@abdm)."
      : undefined
    : undefined;
  const passwordError = touched.password && form.password.length === 0
    ? "Enter your ABHA password."
    : undefined;

  const isFormValid = isValidAbhaIdFormat(trimmedId) && form.password.length > 0;
  const isSubmitDisabled = status === "loading";

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ abhaId: true, password: true });
    setErrorMessage(null);

    if (!isFormValid) return;

    setStatus("loading");
    try {
      const { patient } = await loginWithAbhaId(trimmedId, form.password);
      setPatient(patient);
      navigate("/patient/consent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "We couldn't log you in. Please try again."
      );
      return;
    }
    setStatus("idle");
  }

  return (
    <KioskShell steps={ONBOARDING_STEPS} currentStepId="login">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">ABHA Login</h1>
          <p className="max-w-md text-base text-ink-muted">{EXPLAINER_TEXT}</p>
          <ReadAloudButton text={EXPLAINER_TEXT} />
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="ABHA ID"
              icon={<IdCard className="h-5 w-5" aria-hidden="true" />}
              placeholder="12-3456-7890-1234 or name@abdm"
              autoComplete="username"
              inputMode="text"
              value={form.abhaId}
              onChange={(e) => updateField("abhaId", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, abhaId: true }))}
              errorText={abhaIdError}
              helperText={!abhaIdError ? "Found on your ABHA card or the ABHA mobile app." : undefined}
              disabled={status === "loading"}
              aria-required="true"
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-5 w-5" aria-hidden="true" />}
              placeholder="Enter your ABHA password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              errorText={passwordError}
              disabled={status === "loading"}
              aria-required="true"
            />

            {status === "error" && errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              size="kiosk"
              fullWidth
              disabled={isSubmitDisabled}
              icon={
                status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : undefined
              }
              aria-busy={status === "loading"}
            >
              {status === "loading" ? "Verifying your ABHA ID…" : "Login"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-base text-ink-muted">
          New to MediKiosk?{" "}
          <Link to="/patient/signup" className="font-semibold text-brand underline underline-offset-2">
            Create your ABHA ID
          </Link>
        </p>

        {/* Prototype-only helper — remove once real ABDM auth is connected. */}
        <div className="flex items-start gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            Demo credentials: <strong className="text-ink">14-1234-5678-9012</strong> / password{" "}
            <strong className="text-ink">Demo@123</strong>
          </span>
        </div>
      </div>
    </KioskShell>
  );
}
