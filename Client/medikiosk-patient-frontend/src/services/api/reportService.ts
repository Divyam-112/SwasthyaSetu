// TODO: replace mock implementation with real FastAPI calls via apiRequest().
// Keep the exported function names and shapes stable — pages depend on
// these signatures, not on how they're implemented.
import { mockDelay } from "@/services/mocks/mockDelay";
import { buildWellnessRecommendations } from "@/services/mocks/mockWellnessRecommendations";
import { formatPatientDate } from "@/utils/dateFormat";
import type { GeneratedReport, ReportField, ConfidenceLevel } from "@/types/report";
import type { InterviewAnswer } from "@/types/interview";
import type { UploadedDocument } from "@/types/document";
import type { Patient } from "@/types/patient";
// import { apiRequest } from "./client"; // uncomment when wiring the real report-generation backend

function getAnswerText(answers: InterviewAnswer[], questionId: string): string | null {
  const answer = answers.find((a) => a.questionId === questionId);
  if (!answer || answer.skipped) return null;
  const text = Array.isArray(answer.value) ? answer.value.join(", ") : answer.value;
  return text.trim() ? text : null;
}

function splitIntoPhrases(text: string): string[] {
  return text
    .split(/,| and /i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
}

let fieldCounter = 0;
function nextId(prefix: string): string {
  fieldCounter += 1;
  return `${prefix}-${fieldCounter}`;
}

/** A field the patient stated directly in the interview — high
 * confidence, and already "confirmed" since it came from them. */
function interviewField(
  prefix: string,
  label: string,
  value: string,
  isAbnormal?: boolean
): ReportField {
  return {
    id: nextId(prefix),
    label,
    value,
    confidence: "high",
    source: "interview",
    sourceLabel: "Patient interview",
    status: "confirmed",
    isAbnormal,
  };
}

/** A field pulled from an uploaded document by the (mock) OCR
 * pipeline — medium confidence by default, and always flagged for
 * the patient to check, since no human has verified it yet. */
function documentField(
  prefix: string,
  label: string,
  value: string,
  doc: UploadedDocument,
  confidence: ConfidenceLevel = "medium",
  isAbnormal?: boolean
): ReportField {
  return {
    id: nextId(prefix),
    label,
    value,
    confidence,
    source: "document",
    sourceLabel: doc.fileName,
    status: "needs-verification",
    isAbnormal,
  };
}

// Standing in for real OCR extraction — see mockDocuments.ts for the
// same pattern used on the upload step.
const MOCK_MEDICINES = [
  "Amoxicillin 500mg — twice daily",
  "Paracetamol 650mg — as needed",
  "Atorvastatin 10mg — once daily at night",
  "Metformin 500mg — twice daily",
];

const MOCK_INVESTIGATIONS = [
  "Complete Blood Count (CBC)",
  "Lipid Profile",
  "Blood Sugar (Fasting)",
  "Chest X-Ray",
  "Electrocardiogram (ECG)",
];

/** Generic Review of Systems keyword map. Purely a categorization of
 * what the patient already said onto standard clinical systems — not
 * a new fact, which is why it's still sourced to the interview, just
 * at "medium" confidence (an AI classification, not a verbatim quote). */
const ROS_SYSTEMS: { system: string; keywords: string[] }[] = [
  { system: "Constitutional", keywords: ["fever", "fatigue", "weight", "chills", "weakness"] },
  { system: "Cardiovascular", keywords: ["chest pain", "palpitation", "chest"] },
  { system: "Respiratory", keywords: ["cough", "breath", "wheeze", "congestion"] },
  { system: "Gastrointestinal", keywords: ["stomach", "nausea", "vomit", "diarrhea", "abdomen", "abdominal"] },
  { system: "Neurological", keywords: ["headache", "migraine", "dizziness", "numbness"] },
  { system: "Musculoskeletal", keywords: ["joint", "back", "muscle", "knee", "shoulder", "neck"] },
  { system: "Dermatological", keywords: ["rash", "itching", "skin"] },
];

/**
 * Builds a structured medical history report from the patient's
 * interview answers and uploaded documents, organized the way a
 * clinical H&P note is: Chief Complaint → HPI → Past Medical/Surgical
 * History → Drug Intake → Allergies → Heredity → Review of Systems →
 * Prior Investigation Summary, plus a separate wellness-suggestions
 * block for the doctor to review.
 *
 * MOCK IMPLEMENTATION — no real AI summarization happens here. This
 * only reorganizes what the patient already said/uploaded into
 * sections, and fabricates plausible per-document extraction results
 * (medicines, investigations) since there's no real OCR yet.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<GeneratedReport>("/reports/generate", {
 *     method: "POST",
 *     body: JSON.stringify({ patientId: patient.id }),
 *   });
 * Keep every field's confidence/source/status — that's what lets the
 * doctor (and the patient, on the verification screen) tell "the
 * patient said this" apart from "the OCR pipeline guessed this."
 */
export async function generateMockReport(
  patient: Patient,
  answers: InterviewAnswer[],
  documents: UploadedDocument[]
): Promise<GeneratedReport> {
  fieldCounter = 0;
  const doneDocuments = documents.filter((doc) => doc.state === "done");

  // --- Chief Complaint ---
  const chiefComplaintText = getAnswerText(answers, "chief-complaint");
  const chiefComplaint: ReportField[] = chiefComplaintText
    ? [interviewField("cc", "Reported by patient", chiefComplaintText)]
    : [];

  // --- History of Present Illness ---
  const hpi: ReportField[] = [];
  const complaintPhrases = chiefComplaintText ? splitIntoPhrases(chiefComplaintText) : [];
  complaintPhrases.forEach((phrase) => hpi.push(interviewField("hpi", "Associated symptom", phrase)));
  const onset = getAnswerText(answers, "onset");
  if (onset) hpi.push(interviewField("hpi", "Onset", onset));
  const severity = getAnswerText(answers, "severity");
  if (severity) hpi.push(interviewField("hpi", "Severity / character", severity));

  // --- Past Medical / Surgical History ---
  // Everything populated here is clinically notable by nature, so
  // every item is flagged isAbnormal — its source is still always
  // shown via sourceLabel/confidence/status on the field itself.
  const pastMedicalSurgical: ReportField[] = [];
  const pastConditionsAnswer = answers.find((a) => a.questionId === "past-conditions");
  if (pastConditionsAnswer && !pastConditionsAnswer.skipped) {
    const conditions = Array.isArray(pastConditionsAnswer.value)
      ? pastConditionsAnswer.value
      : [pastConditionsAnswer.value];
    conditions
      .filter((condition) => condition && condition !== "None of these")
      .forEach((condition) =>
        pastMedicalSurgical.push(interviewField("pms", "Ongoing condition", condition, true))
      );
  }
  const previousTreatment = getAnswerText(answers, "previous-treatments");
  if (previousTreatment) {
    pastMedicalSurgical.push(
      interviewField("pms", "Previous treatment / surgery", previousTreatment, true)
    );
  }
  doneDocuments
    .filter((doc) => doc.category === "discharge-summary")
    .forEach((doc) =>
      pastMedicalSurgical.push(
        documentField("pms", "Prior hospitalization", `Noted in ${doc.fileName}`, doc, "medium", true)
      )
    );

  // --- Drug Intake ---
  const drugIntake: ReportField[] = [];
  const currentMedicinesText = getAnswerText(answers, "current-medicines");
  if (currentMedicinesText) {
    drugIntake.push(interviewField("drug", "Reported by patient", currentMedicinesText));
  }
  doneDocuments
    .filter((doc) => doc.category === "prescription")
    .forEach((doc, index) =>
      drugIntake.push(
        documentField(
          "drug",
          "Extracted from prescription",
          MOCK_MEDICINES[index % MOCK_MEDICINES.length],
          doc
        )
      )
    );

  // --- Allergies ---
  const allergyText = getAnswerText(answers, "allergies");
  const allergies: ReportField[] = allergyText
    ? [interviewField("all", "Reported by patient", allergyText)]
    : [];

  // --- Heredity (family history) ---
  const familyHistoryText = getAnswerText(answers, "medical-history");
  const heredity: ReportField[] = familyHistoryText
    ? [interviewField("her", "Family history", familyHistoryText)]
    : [];

  // --- Review of Systems ---
  const reviewOfSystems: ReportField[] = [];
  const rosHaystack = [chiefComplaintText, ...complaintPhrases].filter(Boolean).join(" ").toLowerCase();
  ROS_SYSTEMS.forEach(({ system, keywords }) => {
    const matched = keywords.find((keyword) => rosHaystack.includes(keyword));
    if (matched) {
      reviewOfSystems.push({
        id: nextId("ros"),
        label: system,
        value: `${system}: ${chiefComplaintText ?? matched} reported`,
        confidence: "medium",
        source: "interview",
        sourceLabel: "Patient interview (AI-categorized)",
        status: "confirmed",
      });
    }
  });
  reviewOfSystems.push(
    interviewField(
      "ros",
      "Other systems",
      "All other systems reviewed — no additional complaints reported"
    )
  );

  // --- Prior Investigation Summary ---
  const investigationDocs = doneDocuments.filter((doc) => doc.category === "report");
  const investigationDetails = investigationDocs.map((doc, index) => ({
    label: MOCK_INVESTIGATIONS[index % MOCK_INVESTIGATIONS.length],
    date: formatPatientDate(doc.uploadedAt),
    doc,
  }));
  const priorInvestigationSummary: ReportField[] = [];
  if (investigationDetails.length > 0) {
    const summaryText = investigationDetails
      .map(({ label, date, doc }) => `${label} — ${date} (${doc.fileName})`)
      .join("; ");
    priorInvestigationSummary.push({
      id: nextId("inv-summary"),
      label: "Summary",
      value: `${investigationDetails.length} prior investigation${
        investigationDetails.length === 1 ? "" : "s"
      } on file: ${summaryText}.`,
      confidence: "medium",
      source: "document",
      sourceLabel: `${investigationDetails.length} uploaded document${
        investigationDetails.length === 1 ? "" : "s"
      }`,
      status: "needs-verification",
    });
    investigationDetails.forEach(({ label, date, doc }) =>
      priorInvestigationSummary.push(documentField("inv", "Investigation", `${label} — ${date}`, doc))
    );
  }

  // --- Wellness recommendations (separate block, not a REPORT_SECTIONS entry) ---
  const wellness = buildWellnessRecommendations([
    ...(chiefComplaintText ? [chiefComplaintText] : []),
    ...complaintPhrases,
  ]);

  const sourceSummary =
    doneDocuments.length > 0
      ? `Patient interview + ${doneDocuments.length} document${doneDocuments.length === 1 ? "" : "s"}`
      : "Patient interview only";

  const report: GeneratedReport = {
    patient: {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      abhaId: patient.abhaId,
    },
    generatedAt: new Date().toISOString(),
    chiefComplaint,
    hpi,
    pastMedicalSurgical,
    drugIntake,
    allergies,
    heredity,
    reviewOfSystems,
    priorInvestigationSummary,
    sourceSummary,
    wellness: {
      homeRemedies: wellness.homeRemedies,
      yogaExercises: wellness.yogaExercises,
    },
  };

  return mockDelay(report, 1400);
}

export interface ConfirmReportResult {
  confirmedAt: string;
}

/**
 * Submits the patient-verified report.
 *
 * MOCK IMPLEMENTATION — does not persist anywhere real yet.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<ConfirmReportResult>("/reports/confirm", {
 *     method: "POST",
 *     body: JSON.stringify({ patientId, report }),
 *   });
 * This is also where the confirmed history would get pushed to the
 * hospital HIS/EMR per the ABDM consent framework.
 */
export async function confirmReport(
  patientId: string,
  report: GeneratedReport
): Promise<ConfirmReportResult> {
  return mockDelay({ confirmedAt: new Date().toISOString() }, 900);
}

export interface SendReportResult {
  sentAt: string;
}

/**
 * Sends the patient's verified report to the doctor they picked.
 *
 * MOCK IMPLEMENTATION — does not transmit anywhere real yet.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<SendReportResult>("/reports/send", {
 *     method: "POST",
 *     body: JSON.stringify({ patientId, doctorId, hospitalId, report }),
 *   });
 * This is also where the report would be pushed to the hospital's
 * HIS/EMR and linked to the ABHA PHR via FHIR APIs, per the ABDM
 * consent framework.
 */
export async function sendReportToDoctor(
  patientId: string,
  doctorId: string,
  hospitalId: string,
  report: GeneratedReport
): Promise<SendReportResult> {
  return mockDelay({ sentAt: new Date().toISOString() }, 1200);
}
