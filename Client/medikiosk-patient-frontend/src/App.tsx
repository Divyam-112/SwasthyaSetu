import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AccessibilityProvider } from "@/utils/accessibility";
import { AppRoutes } from "@/app/routes";

export default function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AccessibilityProvider>
  );
}
