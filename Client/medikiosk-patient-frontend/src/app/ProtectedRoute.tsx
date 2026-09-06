import React from "react";
import { Navigate } from "react-router-dom";
import { useSessionStore } from "@/store/sessionStore";

/**
 * Wrap a route element with this once step-skipping needs to be
 * prevented (e.g. redirect back to /patient/login if there's no
 * logged-in patient in the session store). Not applied to any route
 * yet — the onboarding funnel is still being built page by page.
 */
export function ProtectedRoute({
  children,
  requireConsent = false,
}: {
  children: React.ReactElement;
  requireConsent?: boolean;
}) {
  const { patient, hasConsented } = useSessionStore();

  if (!patient) {
    return <Navigate to="/patient/login" replace />;
  }
  if (requireConsent && !hasConsented) {
    return <Navigate to="/patient/consent" replace />;
  }
  return children;
}
