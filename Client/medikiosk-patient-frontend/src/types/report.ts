export type ConfidenceLevel = "high" | "medium" | "low";

/** How certain the doctor should be that this field needs a second look. */
export type FieldStatus = "confirmed" | "needs-verification" | "edited";

export type FieldSource = "interview" | "document" | "patient-edited";

export interface ReportField {
  id: string;
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  source: FieldSource;
  /** Specific, human-readable provenance — "Patient interview" or an
   * actual filename like "Prescription.pdf". This is what's shown to
   * the patient, separately from the coarser `source` union above. */
  sourceLabel: string;
  status: FieldStatus;
  /** Flags a clinically notable finding (e.g. a known condition, a
   * past hospitalization) so it's visually highlighted in Past
   * Medical/Surgical History — its source is always shown too, via
   * the same sourceLabel/confidence/status already on every field. */
  isAbnormal?: boolean;
}

export interface ReportPatientInfo {
  name: string;
  age: number;
  gender: string;
  abhaId: string;
}

export interface GeneratedReport {
  patient: ReportPatientInfo;
  generatedAt: string;
  chiefComplaint: ReportField[];
  /** History of Present Illness — onset, character/severity, and the
   * complaint broken into its component symptoms. */
  hpi: ReportField[];
  /** Past Medical & Surgical History combined — conditions, prior
   * treatment/surgery, and anything noted in a discharge summary.
   * Every populated item here is clinically notable, so it's flagged
   * isAbnormal (see ReportField). */
  pastMedicalSurgical: ReportField[];
  /** Any drug intake — patient-reported plus anything found on an
   * uploaded prescription. */
  drugIntake: ReportField[];
  allergies: ReportField[];
  /** Family history — kept separate from personal past history. */
  heredity: ReportField[];
  /** Review of Systems — a generic systems checklist, flagging any
   * system the chief complaint/HPI touches and noting the rest as
   * reviewed and unremarkable. */
  reviewOfSystems: ReportField[];
  /** A synthesized summary line (dates + sources) followed by the
   * individual investigations it was built from. */
  priorInvestigationSummary: ReportField[];
  /** e.g. "Patient interview + 3 documents" — shown at the foot of the report. */
  sourceSummary: string;
  /** General wellness suggestions for the doctor to review — see
   * WellnessRecommendations below. Not part of the clinical history
   * sections/REPORT_SECTIONS, and not shown on VerificationPage. */
  wellness: WellnessRecommendations;
}

export type ReportSectionKey =
  | "chiefComplaint"
  | "hpi"
  | "pastMedicalSurgical"
  | "drugIntake"
  | "allergies"
  | "heredity"
  | "reviewOfSystems"
  | "priorInvestigationSummary";

/** Drives both GeneratedReportPage and VerificationPage so the two
 * screens can never drift out of sync on section order/titles. */
export const REPORT_SECTIONS: { key: ReportSectionKey; title: string }[] = [
  { key: "chiefComplaint", title: "Chief Complaint" },
  { key: "hpi", title: "History of Present Illness (HPI)" },
  { key: "pastMedicalSurgical", title: "Past Medical / Surgical History" },
  { key: "drugIntake", title: "Drug Intake" },
  { key: "allergies", title: "Allergies" },
  { key: "heredity", title: "Heredity (Family History)" },
  { key: "reviewOfSystems", title: "Review of Systems (ROS)" },
  { key: "priorInvestigationSummary", title: "Prior Investigation Summary" },
];

// --- Wellness recommendations (Ayurvedic home remedies + yoga) ---
// Kept separate from ReportSectionKey/REPORT_SECTIONS on purpose: this
// is a distinct, clearly-labeled block for a doctor to review and
// check off, not part of the clinical history sections above, and
// VerificationPage doesn't render it.

export type WellnessCategory = "home-remedy" | "yoga";

export interface WellnessRecommendation {
  id: string;
  category: WellnessCategory;
  text: string;
  /** The symptom/keyword this suggestion was generated from, shown as context. */
  basedOn: string;
}

export interface WellnessRecommendations {
  homeRemedies: WellnessRecommendation[];
  yogaExercises: WellnessRecommendation[];
}
