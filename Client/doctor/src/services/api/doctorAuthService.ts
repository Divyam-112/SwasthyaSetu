import type { DoctorProfile } from "@/types/doctor-session";
import { findMockDoctorAccount } from "@/services/mocks/mockDoctors";
import { mockDelay } from "@/services/mocks/mockDelay";

export interface DoctorAuthResult {
  doctor: DoctorProfile;
}

/**
 * Authenticates a doctor by email + password.
 * MOCK IMPLEMENTATION — replace body with real FastAPI call when ready.
 *   return apiRequest<DoctorAuthResult>("/doctor/auth/login", { method: "POST", body: ... })
 */
export async function loginDoctor(
  email: string,
  password: string
): Promise<DoctorAuthResult> {
  await mockDelay(null, 900);

  const account = findMockDoctorAccount(email, password);
  if (!account) {
    throw new Error(
      "Invalid email or password. Please check your credentials and try again."
    );
  }
  return { doctor: account.doctor };
}
