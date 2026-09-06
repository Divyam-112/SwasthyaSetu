import { create } from "zustand";
import type { Hospital } from "@/types/hospital";
import type { Doctor } from "@/types/doctor";

interface CareTeamState {
  selectedHospital: Hospital | null;
  selectedDoctor: Doctor | null;
  reportSentAt: string | null;
  selectHospital: (hospital: Hospital) => void;
  selectDoctor: (doctor: Doctor) => void;
  markReportSent: (sentAt: string) => void;
  reset: () => void;
}

/** Holds the patient's hospital/doctor pick for sending their
 * verified report — separate from verificationStore since this is
 * about *where the report goes*, not the report content itself. */
export const useCareTeamStore = create<CareTeamState>((set) => ({
  selectedHospital: null,
  selectedDoctor: null,
  reportSentAt: null,
  selectHospital: (hospital) => set({ selectedHospital: hospital, selectedDoctor: null }),
  selectDoctor: (doctor) => set({ selectedDoctor: doctor }),
  markReportSent: (sentAt) => set({ reportSentAt: sentAt }),
  reset: () => set({ selectedHospital: null, selectedDoctor: null, reportSentAt: null }),
}));
