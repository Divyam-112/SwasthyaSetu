export type ConfidenceLevel = "high" | "medium" | "low";

export interface ReportField {
  id: string;
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  source: "interview" | "document" | "patient-edited";
}

export interface GeneratedReport {
  chiefComplaint: ReportField[];
  symptoms: ReportField[];
  pastMedicalHistory: ReportField[];
  medications: ReportField[];
  allergies: ReportField[];
  previousInvestigations: ReportField[];
}
