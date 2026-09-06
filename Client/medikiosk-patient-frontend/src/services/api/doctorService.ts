// TODO: replace mock implementation with real FastAPI calls via apiRequest().
// Keep the exported function names and shapes stable — pages depend on
// these signatures, not on how they're implemented.
import { mockDelay } from "@/services/mocks/mockDelay";
import { MOCK_DOCTORS } from "@/services/mocks/mockDoctors";
import type { Doctor } from "@/types/doctor";
// import { apiRequest } from "./client"; // uncomment when wiring the real doctor directory

/**
 * Returns the doctors available at a given hospital.
 *
 * MOCK IMPLEMENTATION — filters a fixed local list.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<Doctor[]>(`/hospitals/${hospitalId}/doctors`);
 */
export async function getDoctorsByHospital(hospitalId: string): Promise<Doctor[]> {
  return mockDelay(
    MOCK_DOCTORS.filter((doctor) => doctor.hospitalId === hospitalId),
    500
  );
}
