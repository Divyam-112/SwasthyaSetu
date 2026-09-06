import { create } from "zustand";
import type { DoctorProfile } from "@/types/doctor-session";

interface DoctorSessionState {
  doctor: DoctorProfile | null;
  setDoctor: (doctor: DoctorProfile) => void;
  logout: () => void;
}

export const useDoctorSessionStore = create<DoctorSessionState>((set) => ({
  doctor: null,
  setDoctor: (doctor) => set({ doctor }),
  logout: () => set({ doctor: null }),
}));
