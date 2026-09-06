// TODO: replace mock implementation with real FastAPI calls via apiRequest().
// Keep the exported function names and shapes stable — pages depend on
// these signatures, not on how they're implemented.
import { mockDelay } from "@/services/mocks/mockDelay";
import { MOCK_HOSPITALS } from "@/services/mocks/mockHospitals";
import type { Hospital } from "@/types/hospital";
// import { apiRequest } from "./client"; // uncomment when wiring the real hospital directory

/**
 * Returns nearby/in-network hospitals the patient can send their
 * report to.
 *
 * MOCK IMPLEMENTATION — returns a fixed local list.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<Hospital[]>(`/hospitals?near=${patientLocation}`);
 */
export async function getHospitals(): Promise<Hospital[]> {
  return mockDelay(MOCK_HOSPITALS, 500);
}
