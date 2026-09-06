import type { DoctorProfile } from "@/types/doctor-session";

/**
 * In-memory mock doctor account store. Each entry pairs login credentials
 * with a rich DoctorProfile. Replace with real FastAPI auth when available.
 */
interface MockDoctorAccount {
  email: string;
  password: string;
  doctor: DoctorProfile;
}

const mockDoctorAccounts: MockDoctorAccount[] = [
  {
    email: "dr.priya@medikiosk.in",
    password: "Doctor@123",
    doctor: {
      id: "doc-001",
      name: "Dr. Priya Kumar",
      specialty: "General Medicine",
      nmcNo: "NMC-2019-084721",
      hospital: "AIIMS Jodhpur",
      email: "dr.priya@medikiosk.in",
      initials: "PK",
    },
  },
  {
    email: "dr.rahul@medikiosk.in",
    password: "Doctor@123",
    doctor: {
      id: "doc-002",
      name: "Dr. Rahul Sharma",
      specialty: "Internal Medicine",
      nmcNo: "NMC-2015-031204",
      hospital: "AIIMS Jodhpur",
      email: "dr.rahul@medikiosk.in",
      initials: "RS",
    },
  },
  {
    email: "dr.meena@medikiosk.in",
    password: "Doctor@123",
    doctor: {
      id: "doc-003",
      name: "Dr. Meena Gupta",
      specialty: "Cardiology",
      nmcNo: "NMC-2012-009873",
      hospital: "AIIMS Jodhpur",
      email: "dr.meena@medikiosk.in",
      initials: "MG",
    },
  },
];

export function findMockDoctorAccount(
  email: string,
  password: string
): MockDoctorAccount | undefined {
  return mockDoctorAccounts.find(
    (a) =>
      a.email.toLowerCase() === email.trim().toLowerCase() &&
      a.password === password
  );
}

export { mockDoctorAccounts };
