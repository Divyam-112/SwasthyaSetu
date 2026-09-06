/**
 * DoctorProfile — the authenticated doctor's identity, stored in
 * doctorSessionStore after a successful login. Intentionally minimal;
 * additional fields (schedules, preferences) live in separate API calls.
 */
export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  nmcNo: string; // NMC registration number
  hospital: string;
  email: string;
  /** Initials for avatar placeholder (e.g. "PK" for Dr. Priya Kumar) */
  initials: string;
}
