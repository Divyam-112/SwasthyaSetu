import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AccessibilityProvider } from "@/utils/accessibility";
import { AppRoutes } from "@/app/routes";
import { useDoctorSessionStore } from "@/store/doctorSessionStore";

export default function App() {
  const loadFromStorage = useDoctorSessionStore((s) => s.loadFromStorage);

  // Hydrate doctor session from localStorage on app start
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AccessibilityProvider>
  );
}
