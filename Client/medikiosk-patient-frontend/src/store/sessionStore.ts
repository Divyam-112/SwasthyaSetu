import { create } from "zustand";
import type { Patient } from "@/types/patient";

interface SessionState {
  patient: Patient | null;
  hasConsented: boolean;
  setPatient: (patient: Patient) => void;
  setConsented: (value: boolean) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  patient: null,
  hasConsented: false,
  setPatient: (patient) => set({ patient }),
  setConsented: (value) => set({ hasConsented: value }),
  logout: () => set({ patient: null, hasConsented: false }),
}));
