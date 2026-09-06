import { create } from "zustand";
import type { DoctorProfile } from "@/types/doctor-session";
import { getAuthToken, clearAuthToken } from "@/services/api/client";

const DOCTOR_STORAGE_KEY = "swasthyasetu_doctor_profile";

interface DoctorSessionState {
  doctor: DoctorProfile | null;
  setDoctor: (doctor: DoctorProfile) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useDoctorSessionStore = create<DoctorSessionState>((set) => ({
  doctor: null,

  setDoctor: (doctor) => {
    localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(doctor));
    set({ doctor });
  },

  logout: () => {
    localStorage.removeItem(DOCTOR_STORAGE_KEY);
    clearAuthToken();
    set({ doctor: null });
  },

  loadFromStorage: () => {
    // Only load if token exists (session is valid)
    const token = getAuthToken();
    if (!token) return;

    try {
      const stored = localStorage.getItem(DOCTOR_STORAGE_KEY);
      if (stored) {
        const doctor = JSON.parse(stored) as DoctorProfile;
        set({ doctor });
      }
    } catch {
      // Invalid stored data, clear it
      localStorage.removeItem(DOCTOR_STORAGE_KEY);
    }
  },
}));
