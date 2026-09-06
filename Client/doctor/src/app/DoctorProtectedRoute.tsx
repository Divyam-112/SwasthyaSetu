import React from "react";
import { Navigate } from "react-router-dom";
import { useDoctorSessionStore } from "@/store/doctorSessionStore";

interface DoctorProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps doctor routes that require an authenticated doctor session.
 * Redirects to /doctor (login page) if no doctor is in the session store.
 */
export function DoctorProtectedRoute({ children }: DoctorProtectedRouteProps) {
  const doctor = useDoctorSessionStore((s) => s.doctor);
  if (!doctor) return <Navigate to="/doctor" replace />;
  return <>{children}</>;
}
