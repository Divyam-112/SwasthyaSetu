import React from "react";
import { Cross } from "lucide-react";
import { StepProgressBar } from "./StepProgressBar";
import { AccessibleFooter } from "./AccessibleFooter";

interface Step {
  id: string;
  label: string;
}

interface KioskShellProps {
  children: React.ReactNode;
  /** Pass steps + currentStepId to show the onboarding progress strip. */
  steps?: Step[];
  currentStepId?: string;
  onNeedHelp?: () => void;
}

/**
 * The shared frame for every onboarding-wizard screen (login through
 * verification). Keeps branding, orientation (step bar), and
 * accessibility controls constant so a patient never feels lost
 * moving between steps.
 */
export function KioskShell({
  children,
  steps,
  currentStepId,
  onNeedHelp,
}: KioskShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
            <Cross className="h-6 w-6" />
          </span>
          <span className="text-lg font-semibold text-ink">MediKiosk</span>
        </div>
        {steps && currentStepId && (
          <div className="mx-auto max-w-3xl px-4 pb-4">
            <StepProgressBar steps={steps} currentStepId={currentStepId} />
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {children}
      </main>

      <AccessibleFooter onNeedHelp={onNeedHelp} />
    </div>
  );
}
