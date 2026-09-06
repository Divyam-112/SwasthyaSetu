import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Patient pages moved to a separate app

// Doctor pages
import { DoctorLoginPage } from "@/pages/doctor-auth/DoctorLoginPage";
import { QueuePage } from "@/pages/doctor/QueuePage";
import { PatientReportPage } from "@/pages/doctor/PatientReportPage";
import { PrescriptionComposerPage } from "@/pages/doctor/PrescriptionComposerPage";
import { PatientSearchPage } from "@/pages/doctor/PatientSearchPage";
import { AppointmentsPage } from "@/pages/doctor/AppointmentsPage";
import { DoctorRecordsPage } from "@/pages/doctor/DoctorRecordsPage";
import { DoctorProtectedRoute } from "@/app/DoctorProtectedRoute";

/**
 * Shared step list for the StepProgressBar across the onboarding
 * funnel (login → verification). Doctor search, prescription, and
 * the dashboard live outside this funnel since a returning patient
 * reaches them directly, not through the wizard.
 */
// Onboarding steps are only used in the Patient App

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/doctor" replace />} />
      {/* ── Patient flow (removed) ── */}

      {/* ── Doctor flow ── */}
      {/* Public: login page */}
      <Route path="/doctor" element={<DoctorLoginPage />} />

      {/* Protected: require doctor session */}
      <Route
        path="/doctor/dashboard"
        element={
          <DoctorProtectedRoute>
            <QueuePage />
          </DoctorProtectedRoute>
        }
      />
      <Route
        path="/doctor/search"
        element={
          <DoctorProtectedRoute>
            <PatientSearchPage />
          </DoctorProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <DoctorProtectedRoute>
            <AppointmentsPage />
          </DoctorProtectedRoute>
        }
      />
      <Route
        path="/doctor/records"
        element={
          <DoctorProtectedRoute>
            <DoctorRecordsPage />
          </DoctorProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:patientId/report"
        element={
          <DoctorProtectedRoute>
            <PatientReportPage />
          </DoctorProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:patientId/prescribe"
        element={
          <DoctorProtectedRoute>
            <PrescriptionComposerPage />
          </DoctorProtectedRoute>
        }
      />
    </Routes>
  );
}
