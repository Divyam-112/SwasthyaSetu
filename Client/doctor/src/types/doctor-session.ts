/**
 * DoctorProfile — the authenticated doctor's identity, stored in
 * doctorSessionStore after a successful login.
 * Aligned with the backend Doctor model response.
 */
export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  hospitalId?: string;
  email: string;
  role: string;
  /** Initials for avatar placeholder (e.g. "PK" for Dr. Priya Kumar) */
  initials: string;
}
