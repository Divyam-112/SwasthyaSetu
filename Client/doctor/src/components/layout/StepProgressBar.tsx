import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface Step {
  id: string;
  label: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStepId: string;
}

/**
 * A plain-language "you are here" strip. Deliberately not a generic
 * numbered 1-2-3 chip row — labels always say what the step IS
 * ("Consent", "Your report") so a first-time patient always knows
 * what's happening, not just how far along they are.
 */
export function StepProgressBar({ steps, currentStepId }: StepProgressBarProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    isComplete && "bg-brand border-brand text-white",
                    isCurrent && "border-brand text-brand bg-surface",
                    !isComplete && !isCurrent && "border-border text-ink-muted bg-surface"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium text-center truncate max-w-[80px] hidden sm:block",
                    isCurrent ? "text-brand" : "text-ink-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "h-0.5 flex-1 mx-1",
                    isComplete ? "bg-brand" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
