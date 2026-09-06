import React from "react";
import { Routes, Route } from "react-router-dom";

import { WelcomePage } from "@/pages/welcome/WelcomePage";
import { DoctorRolePlaceholderPage } from "@/pages/doctor-role/DoctorRolePlaceholderPage";
import { AbhaLoginPage } from "@/pages/auth/AbhaLoginPage";
import { AbhaSignupPage } from "@/pages/auth/AbhaSignupPage";
import { ConsentPage } from "@/pages/consent/ConsentPage";
import { InterviewPage } from "@/pages/interview/InterviewPage";
import { UploadDocumentsPage } from "@/pages/documents/UploadDocumentsPage";
import { GeneratedReportPage } from "@/pages/report/GeneratedReportPage";
import { VerificationPage } from "@/pages/verification/VerificationPage";
import { DoctorSearchPage } from "@/pages/doctors/DoctorSearchPage";
import { AppointmentBookingPage } from "@/pages/doctors/AppointmentBookingPage";
import { SendReportPage } from "@/pages/doctors/SendReportPage";
import { HospitalSelectionPage } from "@/pages/hospitals/HospitalSelectionPage";
import { PrescriptionPage } from "@/pages/prescription/PrescriptionPage";
import { RecordsDashboardPage } from "@/pages/dashboard/RecordsDashboardPage";

/**
 * Shared step list for the StepProgressBar across the onboarding
 * funnel (login → verification). Doctor search, prescription, and
 * the dashboard live outside this funnel since a returning patient
 * reaches them directly, not through the wizard.
 */
export const ONBOARDING_STEPS = [
  { id: "login", label: "Login" },
  { id: "consent", label: "Consent" },
  { id: "interview", label: "Interview" },
  { id: "documents", label: "Documents" },
  { id: "report", label: "Your report" },
  { id: "verification", label: "Confirm" },
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/doctor" element={<DoctorRolePlaceholderPage />} />

      <Route path="/patient/login" element={<AbhaLoginPage />} />
      <Route path="/patient/signup" element={<AbhaSignupPage />} />
      <Route path="/patient/consent" element={<ConsentPage />} />
      <Route path="/patient/interview" element={<InterviewPage />} />
      <Route path="/patient/documents" element={<UploadDocumentsPage />} />
      <Route path="/patient/report" element={<GeneratedReportPage />} />
      <Route path="/patient/verification" element={<VerificationPage />} />

      <Route path="/patient/hospitals" element={<HospitalSelectionPage />} />
      <Route path="/patient/doctors" element={<DoctorSearchPage />} />
      <Route
        path="/patient/doctors/:doctorId/send-report"
        element={<SendReportPage />}
      />
      <Route
        path="/patient/doctors/:doctorId/book"
        element={<AppointmentBookingPage />}
      />
      <Route
        path="/patient/prescription/:prescriptionId"
        element={<PrescriptionPage />}
      />

      <Route path="/patient/dashboard" element={<RecordsDashboardPage />} />
    </Routes>
  );
}
