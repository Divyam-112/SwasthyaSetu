export type RecordType =
  | "prescription"
  | "lab-report"
  | "diagnosis"
  | "medical-history"
  | "doctor-visit"
  | "appointment";

export interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  date: string;
  doctorName?: string;
  summary: string;
}
