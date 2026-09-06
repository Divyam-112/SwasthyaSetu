import { apiRequest } from "@/services/api/client";

// ─── Types ───────────────────────────────────────────────────────

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  instructions?: string;
}

export interface PrescriptionData {
  medications: MedicationItem[];
  investigations?: string[];
  advice?: string;
  followUpDate?: string;
  diagnosis?: string;
}

export interface PrescriptionResponse {
  _id: string;
  doctor: string;
  patient: string;
  session: string;
  medications: MedicationItem[];
  investigations: string[];
  advice: string;
  followUpDate?: string;
  diagnosis?: string;
  createdAt: string;
}

interface ApiResponseWrapper<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

/**
 * POST /api/prescription/:sessionId
 * Create a new prescription for a session
 */
export async function createPrescription(
  sessionId: string,
  data: PrescriptionData
): Promise<PrescriptionResponse> {
  const response = await apiRequest<ApiResponseWrapper<PrescriptionResponse>>(
    `/prescription/${sessionId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return response.data;
}

/**
 * GET /api/prescription/:sessionId
 * Get the prescription for a session
 */
export async function getPrescription(
  sessionId: string
): Promise<PrescriptionResponse> {
  const response = await apiRequest<ApiResponseWrapper<PrescriptionResponse>>(
    `/prescription/${sessionId}`
  );
  return response.data;
}

/**
 * PUT /api/prescription/:sessionId
 * Update an existing prescription
 */
export async function updatePrescription(
  sessionId: string,
  data: Partial<PrescriptionData>
): Promise<PrescriptionResponse> {
  const response = await apiRequest<ApiResponseWrapper<PrescriptionResponse>>(
    `/prescription/${sessionId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return response.data;
}
