// TODO: replace mock implementation with real FastAPI calls via apiRequest().
// Keep the exported function names and shapes stable — pages depend on
// these signatures, not on how they're implemented.
import { mockDelay } from "@/services/mocks/mockDelay";
// import { apiRequest } from "./client"; // uncomment when wiring the real FastAPI call

export interface ConsentRecord {
  patientId: string;
  consented: boolean;
  consentedAt: string;
}

/**
 * Records that a patient has given consent to data capture/processing.
 *
 * MOCK IMPLEMENTATION — does not persist anywhere real yet; just
 * simulates the round trip so the Continue button's loading state is
 * meaningful during demos.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<ConsentRecord>("/consent", {
 *     method: "POST",
 *     body: JSON.stringify({ patientId, consented: true }),
 *   });
 * This is also where a real ABDM consent-artifact ID would come back
 * and get stored, per the DPDP/ABDM consent framework — extend
 * ConsentRecord rather than changing this function's name/shape.
 */
export async function recordConsent(patientId: string): Promise<ConsentRecord> {
  return mockDelay(
    {
      patientId,
      consented: true,
      consentedAt: new Date().toISOString(),
    },
    700
  );
}
