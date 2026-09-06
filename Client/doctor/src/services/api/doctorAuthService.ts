import type { DoctorProfile } from "@/types/doctor-session";
import { apiRequest, setAuthToken } from "@/services/api/client";

export interface DoctorAuthResult {
  doctor: DoctorProfile;
  token: string;
}

interface BackendLoginResponse {
  success: boolean;
  data: {
    doctor: {
      _id: string;
      name: string;
      email: string;
      specialization: string;
      hospitalId?: string;
      role: string;
    };
    token: string;
  };
  message: string;
}

/**
 * Authenticates a doctor by email + password via the backend API.
 * POST /api/auth/doctor/login
 */
export async function loginDoctor(
  email: string,
  password: string
): Promise<DoctorAuthResult> {
  const response = await apiRequest<BackendLoginResponse>(
    "/auth/doctor/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true, // No token needed for login
    }
  );

  const { doctor: backendDoctor, token } = response.data;

  // Save JWT token to localStorage
  setAuthToken(token);

  // Map backend fields to frontend DoctorProfile
  const doctor: DoctorProfile = {
    id: backendDoctor._id,
    name: backendDoctor.name,
    email: backendDoctor.email,
    specialization: backendDoctor.specialization,
    hospitalId: backendDoctor.hospitalId,
    role: backendDoctor.role,
    initials: backendDoctor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };

  return { doctor, token };
}
