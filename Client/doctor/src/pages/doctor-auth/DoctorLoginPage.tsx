import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { loginDoctor } from "@/services/api/doctorAuthService";
import { useDoctorSessionStore } from "@/store/doctorSessionStore";

type FormStatus = "idle" | "loading" | "error";

interface FormState {
  email: string;
  password: string;
}

export function DoctorLoginPage() {
  const navigate = useNavigate();
  const setDoctor = useDoctorSessionStore((s) => s.setDoctor);

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    email: false,
    password: false,
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailError =
    touched.email && form.email.trim().length === 0
      ? "Enter your registered email address."
      : undefined;
  const passwordError =
    touched.password && form.password.length === 0
      ? "Enter your password."
      : undefined;

  const isFormValid =
    form.email.trim().length > 0 && form.password.length > 0;
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
    setTouched({ email: true, password: true });
    setErrorMessage(null);

    if (!isFormValid) return;

    setStatus("loading");
    try {
      const { doctor } = await loginDoctor(form.email, form.password);
      setDoctor(doctor);
      navigate("/doctor/dashboard");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    }
  }

  return (
    <KioskShell>
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        {/* Back to role selection */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Stethoscope className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Doctor Login</h1>
          <p className="max-w-md text-base text-ink-muted">
            Sign in with your registered MediKiosk doctor account to access your
            clinical dashboard.
          </p>
        </div>

        {/* Login card */}
        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              icon={<Mail className="h-5 w-5" aria-hidden="true" />}
              placeholder="dr.name@hospital.in"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              errorText={emailError}
              helperText={
                !emailError
                  ? "Use the email you registered with MediKiosk."
                  : undefined
              }
              disabled={status === "loading"}
              aria-required="true"
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-5 w-5" aria-hidden="true" />}
              placeholder="Enter your password"
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
              {status === "loading" ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </Card>

        {/* Demo credentials helper */}
        <div className="flex items-start gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            Demo credentials:{" "}
            <strong className="text-ink">dr.priya@medikiosk.in</strong> /{" "}
            <strong className="text-ink">Doctor@123</strong>
          </span>
        </div>
      </div>
    </KioskShell>
  );
}
