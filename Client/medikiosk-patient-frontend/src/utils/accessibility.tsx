import React, { createContext, useContext, useEffect, useState } from "react";
import { fontSizeSteps, type FontSizeStep } from "@/theme/tokens";

/**
 * A first-time, non-tech-savvy patient should never have to hunt for
 * these controls — they live in the persistent AccessibleFooter on
 * every screen. This context is the single place that state lives,
 * so every page reacts to it the same way without prop drilling.
 */

interface AccessibilityContextValue {
  fontSize: FontSizeStep;
  setFontSize: (step: FontSizeStep) => void;
  cycleFontSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const STEP_ORDER: FontSizeStep[] = ["standard", "large", "xlarge"];

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSize, setFontSize] = useState<FontSizeStep>("standard");
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-scale",
      String(fontSizeSteps[fontSize])
    );
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  const cycleFontSize = () => {
    const currentIndex = STEP_ORDER.indexOf(fontSize);
    const next = STEP_ORDER[(currentIndex + 1) % STEP_ORDER.length];
    setFontSize(next);
  };

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  // Thin wrapper around the Web Speech API. This is the ONE real browser
  // capability we use directly rather than mocking — reading consent
  // text or a question aloud doesn't require any backend. Everything
  // that *would* need a backend (transcription, AI voice replies) stays
  // behind services/ as a mock for now.
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        cycleFontSize,
        highContrast,
        toggleHighContrast,
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return ctx;
}
