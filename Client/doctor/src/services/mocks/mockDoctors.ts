import type { DoctorProfile } from "@/types/doctor-session";

/**
 * Mock doctor accounts — kept for local development/testing fallback.
 * In production, authentication goes through the backend API.
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
      specialization: "General Medicine",
      hospitalId: "AIIMS Jodhpur",
      email: "dr.priya@medikiosk.in",
      role: "doctor",
      initials: "PK",
    },
  },
  {
    email: "dr.rahul@medikiosk.in",
    password: "Doctor@123",
    doctor: {
      id: "doc-002",
      name: "Dr. Rahul Sharma",
      specialization: "General Medicine",
      hospitalId: "AIIMS Jodhpur",
      email: "dr.rahul@medikiosk.in",
      role: "doctor",
      initials: "RS",
    },
  },
  {
    email: "dr.meena@medikiosk.in",
    password: "Doctor@123",
    doctor: {
      id: "doc-003",
      name: "Dr. Meena Gupta",
      specialization: "Ayurveda",
      hospitalId: "AIIMS Jodhpur",
      email: "dr.meena@medikiosk.in",
      role: "doctor",
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
