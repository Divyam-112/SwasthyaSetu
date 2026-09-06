import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  Building2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { apiRequest, setAuthToken } from "@/services/api/client";
import { useDoctorSessionStore } from "@/store/doctorSessionStore";
import type { DoctorProfile } from "@/types/doctor-session";

type FormStatus = "idle" | "loading" | "error";

const SPECIALIZATIONS = [
  "General Medicine",
  "Ayurveda",
  "Pediatrics",
  "Surgery",
  "Gynecology",
  "Dermatology",
  "Orthopedics",
  "ENT",
  "Ophthalmology",
  "Other",
];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  hospitalId: string;
}

interface RegisterResponse {
  success: boolean;
  data: {
    doctor: {
      _id: string;
      name: string;
      email: string;
      specialization: string;
      hospitalId?: string;
      role: string;
    };
    token: string;
  };
  message: string;
}

export function DoctorRegisterPage() {
  const navigate = useNavigate();
  const setDoctor = useDoctorSessionStore((s) => s.setDoctor);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "General Medicine",
    hospitalId: "",
  });

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  }

  const isFormValid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    if (!isFormValid) {
      if (form.password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        setStatus("error");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setStatus("error");
        return;
      }
      return;
    }

    setStatus("loading");
    try {
      const response = await apiRequest<RegisterResponse>(
        "/auth/doctor/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            specialization: form.specialization,
            hospitalId: form.hospitalId.trim() || undefined,
          }),
          skipAuth: true,
        }
      );

      const { doctor: backendDoctor, token } = response.data;

      // Save JWT token
      setAuthToken(token);

      // Map to frontend profile
      const doctor: DoctorProfile = {
        id: backendDoctor._id,
        name: backendDoctor.name,
        email: backendDoctor.email,
        specialization: backendDoctor.specialization,
        hospitalId: backendDoctor.hospitalId,
        role: backendDoctor.role,
        initials: backendDoctor.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      };

      setDoctor(doctor);
      navigate("/doctor/dashboard");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    }
  }

  return (
    <KioskShell>
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        {/* Back to login */}
        <Link
          to="/doctor"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Stethoscope className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">
            Doctor Registration
          </h1>
          <p className="max-w-md text-base text-ink-muted">
            Create your SwasthyaSetu doctor account to access the
            clinical dashboard and manage patients.
          </p>
        </div>

        {/* Registration form */}
        <Card>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              label="Full Name"
              type="text"
              icon={
                <User
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
              placeholder="Dr. John Sharma"
              autoComplete="name"
              value={form.name}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              disabled={status === "loading"}
              aria-required="true"
            />

            <Input
              label="Email Address"
              type="email"
              icon={
                <Mail
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
              placeholder="dr.name@hospital.in"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              disabled={status === "loading"}
              aria-required="true"
            />

            <div className="flex flex-col gap-2">
              <label className="block text-base font-medium text-ink">
                Specialization
              </label>
              <select
                className="w-full rounded-md border-2 border-border bg-surface px-4 py-2.5 text-base text-ink focus:border-brand focus:outline-none"
                value={form.specialization}
                onChange={(e) =>
                  updateField(
                    "specialization",
                    e.target.value
                  )
                }
                disabled={status === "loading"}
              >
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Hospital / Clinic (Optional)"
              type="text"
              icon={
                <Building2
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
              placeholder="e.g. AIIMS Jodhpur"
              value={form.hospitalId}
              onChange={(e) =>
                updateField("hospitalId", e.target.value)
              }
              disabled={status === "loading"}
            />

            <Input
              label="Password"
              type="password"
              icon={
                <Lock
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                updateField("password", e.target.value)
              }
              disabled={status === "loading"}
              aria-required="true"
              helperText="Password must be at least 6 characters."
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={
                <Lock
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
              placeholder="Re-enter password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) =>
                updateField(
                  "confirmPassword",
                  e.target.value
                )
              }
              disabled={status === "loading"}
              aria-required="true"
              errorText={
                form.confirmPassword.length > 0 &&
                form.password !== form.confirmPassword
                  ? "Passwords do not match."
                  : undefined
              }
            />

            {status === "error" && errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              size="kiosk"
              fullWidth
              disabled={status === "loading"}
              icon={
                status === "loading" ? (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                )
              }
              aria-busy={status === "loading"}
            >
              {status === "loading"
                ? "Creating Account…"
                : "Create Account"}
            </Button>
          </form>
        </Card>

        {/* Already have account */}
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            to="/doctor"
            className="font-medium text-brand hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </KioskShell>
  );
}
