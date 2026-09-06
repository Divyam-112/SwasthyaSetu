import { apiRequest } from "@/services/api/client";

// ─── Types ───────────────────────────────────────────────────────

export interface QueueEntry {
  appointmentId: string;
  tokenNumber: number;
  patientName: string;
  age?: number;
  gender?: string;
  abhaId?: string;
  phone?: string;
  sessionId: string;
  sessionType?: string;
  chiefComplaint: string;
  sessionStatus?: string;
  completionPercentage?: number;
  hasRedFlags: boolean;
  redFlags: string[];
  hasSummary: boolean;
  appointmentStatus: string;
  preferredTimeSlot?: string;
  scheduledDate: string;
  createdAt: string;
}

export interface DoctorQueueResponse {
  date: string;
  totalAppointments: number;
  queue: QueueEntry[];
}

export interface PatientDetail {
  _id: string;
  patient: {
    _id: string;
    name: string;
    age?: number;
    gender?: string;
    abhaId?: string;
    phone?: string;
    preferredLanguage?: string;
  };
  sessionType: string;
  status: string;
  completionPercentage: number;
  clinicalHistory: {
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string;
    familyHistory?: string;
    personalHistory?: string;
    drugHistory?: string;
    allergies?: string;
    systemicReview?: string;
    generalExamination?: string;
  };
  clinicalSummary?: {
    generatedText?: string;
    patientSummary?: string;
    ayushSummary?: string;
    redFlags?: string[];
    abnormalValues?: string[];
    drugInteractions?: string[];
    generatedAt?: string;
  };
  ayushAssessment?: {
    prakriti?: string;
    vikriti?: string;
    agni?: string;
    koshtha?: string;
    dashavidhaPariksha?: string;
  };
  doctorReview?: {
    reviewedBy?: string;
    reviewedAt?: string;
    status?: string;
    modifications?: string;
  };
  prescription?: string;
  appointment?: string;
  createdAt: string;
}

// ─── API Calls ───────────────────────────────────────────────────

interface ApiResponseWrapper<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

/**
 * GET /api/appointment/doctor/queue
 * Fetch doctor's patient queue for a specific date
 */
export async function fetchDoctorQueue(
  date?: string,
  status?: string
): Promise<DoctorQueueResponse> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (status) params.append("status", status);

  const queryString = params.toString();
  const path = `/appointment/doctor/queue${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<ApiResponseWrapper<DoctorQueueResponse>>(path);
  return response.data;
}

/**
 * GET /api/doctor/patient/:sessionId
 * Fetch full patient detail for a session
 */
export async function fetchPatientDetail(
  sessionId: string
): Promise<PatientDetail> {
  const response = await apiRequest<ApiResponseWrapper<PatientDetail>>(
    `/doctor/patient/${sessionId}`
  );
  return response.data;
}

/**
 * PUT /api/doctor/review/:sessionId
 * Doctor submits review (accept / modify / reject)
 */
export async function submitReview(
  sessionId: string,
  status: "accepted" | "modified" | "rejected",
  modifications?: string
): Promise<{ sessionId: string; reviewStatus: string; reviewedAt: string }> {
  const response = await apiRequest<
    ApiResponseWrapper<{ sessionId: string; reviewStatus: string; reviewedAt: string }>
  >(`/doctor/review/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify({ status, modifications }),
  });
  return response.data;
}

/**
 * PUT /api/appointment/doctor/status/:appointmentId
 * Update appointment status (in_progress / completed / no_show)
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "in_progress" | "completed" | "no_show",
  doctorNotes?: string
): Promise<{
  appointmentId: string;
  tokenNumber: number;
  status: string;
  completedAt?: string;
}> {
  const response = await apiRequest<
    ApiResponseWrapper<{
      appointmentId: string;
      tokenNumber: number;
      status: string;
      completedAt?: string;
    }>
  >(`/appointment/doctor/status/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify({ status, doctorNotes }),
  });
  return response.data;
}
