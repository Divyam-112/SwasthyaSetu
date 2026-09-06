import { apiRequest } from "@/services/api/client";

// ─── Types ───────────────────────────────────────────────────────

export interface ClinicalSummary {
  generatedText?: string;
  patientSummary?: string;
  ayushSummary?: string;
  redFlags?: string[];
  abnormalValues?: string[];
  drugInteractions?: string[];
  generatedAt?: string;
}

export interface SummaryResponse {
  summary: ClinicalSummary;
  patientInfo: {
    _id: string;
    name: string;
    age?: number;
    gender?: string;
    abhaId?: string;
  };
  clinicalHistory: Record<string, string | undefined>;
  ayushAssessment?: Record<string, string | undefined>;
}

interface ApiResponseWrapper<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

/**
 * GET /api/summary/:sessionId
 * Get the generated clinical summary for a session
 */
export async function fetchSummary(
  sessionId: string
): Promise<SummaryResponse> {
  const response = await apiRequest<ApiResponseWrapper<SummaryResponse>>(
    `/summary/${sessionId}`
  );
  return response.data;
}

/**
 * POST /api/summary/generate/:sessionId
 * Generate clinical summary from session data
 */
export async function generateSummary(sessionId: string): Promise<{
  summary: string;
  patientSummary: string;
  ayushSummary: string;
  redFlags: string[];
  abnormalValues: string[];
  drugInteractions: string[];
  generatedAt: string;
}> {
  const response = await apiRequest<
    ApiResponseWrapper<{
      summary: string;
      patientSummary: string;
      ayushSummary: string;
      redFlags: string[];
      abnormalValues: string[];
      drugInteractions: string[];
      generatedAt: string;
    }>
  >(`/summary/generate/${sessionId}`, { method: "POST" });
  return response.data;
}
