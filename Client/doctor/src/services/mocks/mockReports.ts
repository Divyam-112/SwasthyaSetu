import type { GeneratedReport } from "@/types/report";

/**
 * Mock AI-generated reports keyed by patientId.
 * Confidence: "high" = AI is sure, "medium" = likely correct, "low" = uncertain.
 * Low-confidence fields should be highlighted with the amber accent in the UI.
 */
export const mockReports: Record<string, GeneratedReport> = {
  "mock-patient-demo1": {
    chiefComplaint: [
      { id: "cc-1", label: "Primary Complaint", value: "Persistent fever for 5 days with body ache and chills", confidence: "high", source: "interview" },
      { id: "cc-2", label: "Onset", value: "Sudden onset 5 days ago", confidence: "high", source: "interview" },
      { id: "cc-3", label: "Severity (Self-rated)", value: "7 / 10", confidence: "medium", source: "interview" },
    ],
    symptoms: [
      { id: "s-1", label: "Fever", value: "Yes — 102°F at home (patient-reported)", confidence: "high", source: "interview" },
      { id: "s-2", label: "Body ache", value: "Generalised, worse in legs", confidence: "high", source: "interview" },
      { id: "s-3", label: "Headache", value: "Frontal, mild", confidence: "medium", source: "interview" },
      { id: "s-4", label: "Nausea / Vomiting", value: "Nausea present, no vomiting", confidence: "high", source: "interview" },
      { id: "s-5", label: "Rash", value: "Denies rash", confidence: "medium", source: "interview" },
    ],
    pastMedicalHistory: [
      { id: "pmh-1", label: "Diabetes", value: "No", confidence: "high", source: "interview" },
      { id: "pmh-2", label: "Hypertension", value: "No", confidence: "high", source: "interview" },
      { id: "pmh-3", label: "Previous hospitalisations", value: "None reported", confidence: "low", source: "interview" },
    ],
    medications: [
      { id: "med-1", label: "Current Medications", value: "Paracetamol 500 mg SOS (self-medicated)", confidence: "high", source: "interview" },
    ],
    allergies: [
      { id: "al-1", label: "Drug Allergies", value: "None known", confidence: "medium", source: "interview" },
      { id: "al-2", label: "Food Allergies", value: "Not asked / unclear", confidence: "low", source: "interview" },
    ],
    previousInvestigations: [
      { id: "pi-1", label: "CBC (Last)", value: "Not available — patient could not recall date", confidence: "low", source: "document" },
      { id: "pi-2", label: "Malaria RDT", value: "Not done recently", confidence: "medium", source: "interview" },
    ],
  },

  "mock-patient-demo2": {
    chiefComplaint: [
      { id: "cc-1", label: "Primary Complaint", value: "Chest pain on exertion for 3 weeks", confidence: "high", source: "interview" },
      { id: "cc-2", label: "Character", value: "Pressure-like, radiating to left arm", confidence: "high", source: "interview" },
      { id: "cc-3", label: "Relieving Factors", value: "Rest relieves pain within 5–10 minutes", confidence: "high", source: "interview" },
    ],
    symptoms: [
      { id: "s-1", label: "Dyspnoea", value: "On moderate exertion (Grade 2 NYHA)", confidence: "medium", source: "interview" },
      { id: "s-2", label: "Palpitations", value: "Occasional, non-sustained", confidence: "medium", source: "interview" },
      { id: "s-3", label: "Syncope", value: "No", confidence: "high", source: "interview" },
      { id: "s-4", label: "Orthopnoea", value: "Uncertain — patient gave inconsistent answers", confidence: "low", source: "interview" },
    ],
    pastMedicalHistory: [
      { id: "pmh-1", label: "Hypertension", value: "Yes — diagnosed 8 years ago", confidence: "high", source: "document" },
      { id: "pmh-2", label: "Diabetes", value: "Type 2 — on oral medication", confidence: "high", source: "document" },
      { id: "pmh-3", label: "Prior MI / Angina", value: "Denies prior cardiac events", confidence: "medium", source: "interview" },
    ],
    medications: [
      { id: "med-1", label: "Metformin", value: "500 mg BD", confidence: "high", source: "document" },
      { id: "med-2", label: "Amlodipine", value: "5 mg OD — patient unsure of dose", confidence: "low", source: "interview" },
      { id: "med-3", label: "Aspirin", value: "Not currently on aspirin (self-reported)", confidence: "medium", source: "interview" },
    ],
    allergies: [
      { id: "al-1", label: "Drug Allergies", value: "Sulfa drugs — rash (documented 2019)", confidence: "high", source: "document" },
    ],
    previousInvestigations: [
      { id: "pi-1", label: "ECG (2024)", value: "Uploaded — LVH changes noted", confidence: "high", source: "document" },
      { id: "pi-2", label: "Echo", value: "Not done", confidence: "high", source: "interview" },
      { id: "pi-3", label: "Lipid Profile", value: "Partial report — total cholesterol 214 mg/dL, LDL unclear", confidence: "low", source: "document" },
    ],
  },

  "pat-003": {
    chiefComplaint: [
      { id: "cc-1", label: "Primary Complaint", value: "Left knee pain for 3 months, worse with stairs", confidence: "high", source: "interview" },
    ],
    symptoms: [
      { id: "s-1", label: "Swelling", value: "Mild peri-articular swelling", confidence: "high", source: "interview" },
      { id: "s-2", label: "Morning Stiffness", value: "~15 minutes, self-reported", confidence: "medium", source: "interview" },
      { id: "s-3", label: "Locking / Giving Way", value: "Occasional giving way, no locking", confidence: "medium", source: "interview" },
    ],
    pastMedicalHistory: [
      { id: "pmh-1", label: "Osteoarthritis", value: "Not formally diagnosed, suspected", confidence: "low", source: "interview" },
      { id: "pmh-2", label: "Prior Trauma", value: "Fall 2 years ago — no imaging done", confidence: "medium", source: "interview" },
    ],
    medications: [
      { id: "med-1", label: "Diclofenac Gel", value: "OTC, using sporadically", confidence: "high", source: "interview" },
    ],
    allergies: [
      { id: "al-1", label: "Drug Allergies", value: "None known", confidence: "high", source: "interview" },
    ],
    previousInvestigations: [
      { id: "pi-1", label: "X-Ray Knee", value: "Not done", confidence: "high", source: "interview" },
    ],
  },
};

/** Returns a report or a placeholder if patientId not found in mock data. */
export function getMockReport(patientId: string): GeneratedReport | null {
  return mockReports[patientId] ?? null;
}
