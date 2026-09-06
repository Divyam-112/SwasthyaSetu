import { create } from "zustand";
import type { GeneratedReport, ReportSectionKey } from "@/types/report";

interface VerificationState {
  report: GeneratedReport | null;
  isConfirmed: boolean;
  confirmedAt: string | null;
  setReport: (report: GeneratedReport) => void;
  /** Patient corrects a field's value on the verification screen.
   * Re-sourcing it to "patient-edited" and marking it confirmed is
   * exactly what makes an edit double as verification. */
  updateField: (section: ReportSectionKey, fieldId: string, value: string) => void;
  markConfirmed: (confirmedAt: string) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
  report: null,
  isConfirmed: false,
  confirmedAt: null,
  setReport: (report) => set({ report }),
  updateField: (section, fieldId, value) =>
    set((state) => {
      if (!state.report) return state;
      const updatedSection = state.report[section].map((field) =>
        field.id === fieldId
          ? {
              ...field,
              value,
              confidence: "high" as const,
              source: "patient-edited" as const,
              sourceLabel: "Edited by patient",
              status: "confirmed" as const,
            }
          : field
      );
      return { report: { ...state.report, [section]: updatedSection } };
    }),
  markConfirmed: (confirmedAt) => set({ isConfirmed: true, confirmedAt }),
  reset: () => set({ report: null, isConfirmed: false, confirmedAt: null }),
}));
