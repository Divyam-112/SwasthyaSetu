import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Printer,
  Send,
  CheckCircle2,
  Loader2,
  Pill,
  FlaskConical,
  CalendarDays,
  FileText,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { mockQueue } from "@/services/mocks/mockQueue";
import { mockDelay } from "@/services/mocks/mockDelay";
import { cn } from "@/utils/cn";

interface MedicationRow {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const LAB_TESTS = [
  "Complete Blood Count (CBC)",
  "Blood Sugar Fasting",
  "Blood Sugar PP",
  "HbA1c",
  "Lipid Profile",
  "Liver Function Test (LFT)",
  "Kidney Function Test (KFT)",
  "Thyroid Profile (TSH)",
  "Urine Routine",
  "Chest X-Ray",
  "ECG",
  "Echo",
  "Ultrasound Abdomen",
  "Malaria RDT",
  "Dengue NS1 Antigen",
];

const FREQUENCIES = [
  "Once daily (OD)",
  "Twice daily (BD)",
  "Three times daily (TDS)",
  "Four times daily (QID)",
  "As needed (SOS)",
  "At bedtime (HS)",
  "Every 8 hours",
  "Every 12 hours",
];

function newMedRow(): MedicationRow {
  return {
    id: crypto.randomUUID(),
    drug: "",
    dose: "",
    frequency: "",
    duration: "",
    instructions: "",
  };
}

export function PrescriptionComposerPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const patient = mockQueue.find((p) => p.patientId === patientId);

  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState<MedicationRow[]>([newMedRow()]);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [customTest, setCustomTest] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent">("idle");

  function updateMed(id: string, field: keyof MedicationRow, value: string) {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  function removeMed(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }

  function toggleTest(test: string) {
    setSelectedTests((prev) => {
      const next = new Set(prev);
      next.has(test) ? next.delete(test) : next.add(test);
      return next;
    });
  }

  async function handleSendToKiosk() {
    setSendStatus("sending");
    await mockDelay(null, 1500);
    setSendStatus("sent");
  }

  if (!patient) {
    return (
      <DoctorShell pageTitle="Write Prescription">
        <p className="text-ink-muted">Patient not found.</p>
      </DoctorShell>
    );
  }

  return (
    <DoctorShell pageTitle="Write Prescription">
      {/* Back */}
      <button
        onClick={() => navigate(`/doctor/patients/${patientId}/report`)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Report
      </button>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left — Prescription form */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Patient summary */}
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand flex-shrink-0">
                {patient.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              <div>
                <p className="font-semibold text-ink">{patient.patientName}</p>
                <p className="text-sm text-ink-muted">
                  {patient.age}y · {patient.gender} · {patient.abhaId}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-ink-muted">Presenting complaint</p>
                <p className="text-sm font-medium text-ink">{patient.chiefComplaint}</p>
              </div>
            </div>
          </Card>

          {/* Diagnosis */}
          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              <FileText className="h-4 w-4 text-brand" />
              Diagnosis / Clinical Impression
            </h3>
            <textarea
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none resize-none"
              rows={3}
              placeholder="Enter diagnosis or clinical impression…"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </Card>

          {/* Medications */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
              <Pill className="h-4 w-4 text-brand" />
              Medications
            </h3>
            <div className="flex flex-col gap-4">
              {medications.map((med, idx) => (
                <div
                  key={med.id}
                  className="rounded-md border border-border bg-bg p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-muted">
                      Medication {idx + 1}
                    </span>
                    {medications.length > 1 && (
                      <button
                        onClick={() => removeMed(med.id)}
                        className="rounded p-1 text-ink-muted hover:text-error transition-colors"
                        aria-label="Remove medication"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Drug Name"
                      placeholder="e.g. Paracetamol"
                      value={med.drug}
                      onChange={(e) => updateMed(med.id, "drug", e.target.value)}
                    />
                    <Input
                      label="Dose"
                      placeholder="e.g. 500 mg"
                      value={med.dose}
                      onChange={(e) => updateMed(med.id, "dose", e.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                      <label className="block text-base font-medium text-ink">Frequency</label>
                      <select
                        className="w-full rounded-md border-2 border-border bg-surface px-4 py-2.5 text-base text-ink focus:border-brand focus:outline-none"
                        value={med.frequency}
                        onChange={(e) => updateMed(med.id, "frequency", e.target.value)}
                      >
                        <option value="">Select frequency…</option>
                        {FREQUENCIES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Duration"
                      placeholder="e.g. 5 days"
                      value={med.duration}
                      onChange={(e) => updateMed(med.id, "duration", e.target.value)}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Special Instructions"
                        placeholder="e.g. Take after food, avoid alcohol"
                        value={med.instructions}
                        onChange={(e) =>
                          updateMed(med.id, "instructions", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setMedications((prev) => [...prev, newMedRow()])}
                className="flex items-center gap-2 rounded-md border border-dashed border-brand px-4 py-3 text-sm font-medium text-brand hover:bg-brand/5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Medication
              </button>
            </div>
          </Card>

          {/* Lab Tests */}
          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              <FlaskConical className="h-4 w-4 text-brand" />
              Investigations Ordered
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-3">
              {LAB_TESTS.map((test) => (
                <label
                  key={test}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                    selectedTests.has(test)
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-border text-ink hover:border-brand/50"
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-brand"
                    checked={selectedTests.has(test)}
                    onChange={() => toggleTest(test)}
                  />
                  {test}
                </label>
              ))}
            </div>
            <Input
              label="Additional Tests"
              placeholder="Type any other test…"
              value={customTest}
              onChange={(e) => setCustomTest(e.target.value)}
            />
          </Card>

          {/* Follow-up + General Advice */}
          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              <CalendarDays className="h-4 w-4 text-brand" />
              Follow-up & Advice
            </h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Follow-up Date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <label className="block text-base font-medium text-ink">
                  General Advice / Diet / Lifestyle
                </label>
                <textarea
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none resize-none"
                  rows={3}
                  placeholder="Rest, hydration, dietary restrictions, activity guidelines…"
                  value={generalAdvice}
                  onChange={(e) => setGeneralAdvice(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right — Actions panel */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
          <Card>
            <h3 className="mb-3 text-base font-semibold text-ink">Actions</h3>

            {sendStatus === "sent" ? (
              <div className="flex flex-col items-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-5 text-center text-success">
                <CheckCircle2 className="h-8 w-8" />
                <p className="font-semibold">Sent to Kiosk</p>
                <p className="text-xs text-ink-muted">
                  Patient can collect the prescription printout at the kiosk.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSendToKiosk}
                  disabled={sendStatus === "sending"}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {sendStatus === "sending" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {sendStatus === "sending" ? "Sending…" : "Send to Kiosk"}
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-bg transition-colors">
                  <Printer className="h-4 w-4" />
                  Print Prescription
                </button>
              </>
            )}
          </Card>

          {/* Summary pill */}
          <Card>
            <h4 className="mb-2 text-sm font-semibold text-ink-muted uppercase tracking-wide">
              Prescription Summary
            </h4>
            <ul className="flex flex-col gap-1 text-sm text-ink">
              <li>
                <span className="text-ink-muted">Medications: </span>
                <strong>{medications.filter((m) => m.drug).length}</strong>
              </li>
              <li>
                <span className="text-ink-muted">Tests ordered: </span>
                <strong>
                  {selectedTests.size + (customTest.trim() ? 1 : 0)}
                </strong>
              </li>
              {followUpDate && (
                <li>
                  <span className="text-ink-muted">Follow-up: </span>
                  <strong>{new Date(followUpDate).toLocaleDateString("en-IN")}</strong>
                </li>
              )}
            </ul>
          </Card>
        </aside>
      </div>
    </DoctorShell>
  );
}
