import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2, AlertCircle, IdCard, Lock, User, Phone } from "lucide-react";
import { KioskShell, ReadAloudButton } from "@/components/layout";
import { Button, Card, Input, Select } from "@/components/ui";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useSessionStore } from "@/store/sessionStore";
import type { Patient } from "@/types/patient";
import {
  signupWithAbhaId,
  isValidAbhaIdFormat,
  isValidPassword,
} from "@/services/api/authService";

const EXPLAINER_TEXT =
  "Creating an ABHA ID gives you a permanent digital health identity issued under the Ayushman Bharat Digital Mission. You'll use this same ID and password to log in on any future visit, and to control who can see your health records.";

type FormStatus = "idle" | "loading" | "error";

interface FormState {
  name: string;
  age: string;
  gender: Patient["gender"];
  phone: string;
  abhaId: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormState = {
  name: "",
  age: "",
  gender: "female",
  phone: "",
  abhaId: "",
  password: "",
  confirmPassword: "",
};

type FieldName = keyof FormState;

export function AbhaSignupPage() {
  const navigate = useNavigate();
  const setPatient = useSessionStore((state) => state.setPatient);

  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField<K extends FieldName>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  }

  function markTouched(field: FieldName) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const trimmedId = form.abhaId.trim();
  const ageNumber = Number(form.age);

  const errors: Partial<Record<FieldName, string>> = {
    name: form.name.trim().length === 0 ? "Enter your full name." : undefined,
    age:
      form.age.trim().length === 0
        ? "Enter your age."
        : !Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 120
        ? "Enter a valid age."
        : undefined,
    phone:
      form.phone.trim().length === 0
        ? "Enter your phone number."
        : !/^\d{10}$/.test(form.phone.trim())
        ? "Enter a valid 10-digit phone number."
        : undefined,
    abhaId:
      trimmedId.length === 0
        ? "Choose an ABHA ID."
        : !isValidAbhaIdFormat(trimmedId)
        ? "Use a 14-digit number (e.g. 12-3456-7890-1234) or an address (e.g. name@abdm)."
        : undefined,
    password: !isValidPassword(form.password)
      ? "At least 8 characters, with a letter and a number."
      : undefined,
    confirmPassword:
      form.confirmPassword !== form.password ? "Passwords don't match." : undefined,
  };

  const isFormValid = Object.values(errors).every((error) => !error);
  const isSubmitDisabled = status === "loading";

  function fieldError(field: FieldName): string | undefined {
    return touched[field] ? errors[field] : undefined;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({
      name: true,
      age: true,
      phone: true,
      abhaId: true,
      password: true,
      confirmPassword: true,
    });
    setErrorMessage(null);

    if (!isFormValid) return;

    setStatus("loading");
    try {
      const { patient } = await signupWithAbhaId({
        abhaId: trimmedId,
        password: form.password,
        name: form.name.trim(),
        age: ageNumber,
        gender: form.gender,
        phone: form.phone.trim(),
      });
      setPatient(patient);
      navigate("/patient/consent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "We couldn't create your ABHA ID. Please try again."
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
            <UserPlus className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Create your ABHA ID</h1>
          <p className="max-w-md text-base text-ink-muted">{EXPLAINER_TEXT}</p>
          <ReadAloudButton text={EXPLAINER_TEXT} />
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="Full name"
              icon={<User className="h-5 w-5" aria-hidden="true" />}
              placeholder="As per your ID proof"
              autoComplete="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              onBlur={() => markTouched("name")}
              errorText={fieldError("name")}
              disabled={status === "loading"}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 45"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                onBlur={() => markTouched("age")}
                errorText={fieldError("age")}
                disabled={status === "loading"}
              />
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value as Patient["gender"])}
                disabled={status === "loading"}
                options={[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <Input
              label="Phone number"
              icon={<Phone className="h-5 w-5" aria-hidden="true" />}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              onBlur={() => markTouched("phone")}
              errorText={fieldError("phone")}
              disabled={status === "loading"}
            />

            <div className="h-px bg-border" />

            <Input
              label="Choose your ABHA ID"
              icon={<IdCard className="h-5 w-5" aria-hidden="true" />}
              placeholder="12-3456-7890-1234 or name@abdm"
              autoComplete="username"
              value={form.abhaId}
              onChange={(e) => updateField("abhaId", e.target.value)}
              onBlur={() => markTouched("abhaId")}
              errorText={fieldError("abhaId")}
              helperText={!fieldError("abhaId") ? "This becomes your login ID for every future visit." : undefined}
              disabled={status === "loading"}
            />

            <Input
              label="Create password"
              type="password"
              icon={<Lock className="h-5 w-5" aria-hidden="true" />}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              onBlur={() => markTouched("password")}
              errorText={fieldError("password")}
              disabled={status === "loading"}
            />

            <Input
              label="Confirm password"
              type="password"
              icon={<Lock className="h-5 w-5" aria-hidden="true" />}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              errorText={fieldError("confirmPassword")}
              disabled={status === "loading"}
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
              {status === "loading" ? "Creating your ABHA ID…" : "Create ABHA ID & Continue"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-base text-ink-muted">
          Already have an ABHA ID?{" "}
          <Link to="/patient/login" className="font-semibold text-brand underline underline-offset-2">
            Log in instead
          </Link>
        </p>
      </div>
    </KioskShell>
  );
}
