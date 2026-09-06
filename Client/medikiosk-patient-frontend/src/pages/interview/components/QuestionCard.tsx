import React from "react";
import { Stethoscope, Volume2 } from "lucide-react";
import { useAccessibility } from "@/utils/accessibility";

interface QuestionCardProps {
  question: string;
  helperText?: string;
}

/**
 * One question at a time, presented like a clinical intake form
 * reading itself aloud — not a scrolling chat thread. That's the main
 * thing that keeps this from feeling like a generic chatbot: there's
 * no message history, no "typing…" bubble, no back-and-forth log.
 */
export function QuestionCard({ question, helperText }: QuestionCardProps) {
  const { speak, isSpeaking } = useAccessibility();

  return (
    <div className="flex gap-4">
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
        aria-hidden="true"
      >
        <Stethoscope className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <p className="text-xl font-semibold leading-snug text-ink">{question}</p>
        {helperText && (
          <p className="mt-1.5 text-base text-ink-muted">{helperText}</p>
        )}
        <button
          type="button"
          onClick={() => speak(question)}
          className="mt-3 inline-flex min-h-tap items-center gap-2 rounded-md border-2 border-brand px-4 text-sm font-medium text-brand hover:bg-brand/5"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          {isSpeaking ? "Repeating…" : "Repeat question"}
        </button>
      </div>
    </div>
  );
}
