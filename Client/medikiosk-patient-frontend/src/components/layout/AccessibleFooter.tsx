import React from "react";
import { Type, Contrast, Volume2, VolumeX, HelpCircle } from "lucide-react";
import { useAccessibility } from "@/utils/accessibility";
import { cn } from "@/utils/cn";

/**
 * Always visible, always in the same place, on every screen — a
 * first-time patient should never have to hunt through a settings
 * menu to make text bigger or hear a screen read aloud.
 */
export function AccessibleFooter({
  onNeedHelp,
}: {
  onNeedHelp?: () => void;
}) {
  const {
    cycleFontSize,
    fontSize,
    highContrast,
    toggleHighContrast,
    isSpeaking,
    stopSpeaking,
  } = useAccessibility();

  const fontSizeLabel =
    fontSize === "standard" ? "Standard" : fontSize === "large" ? "Large" : "Extra large";

  return (
    <footer className="sticky bottom-0 w-full border-t border-border bg-surface">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 px-4 py-2">
        <FooterButton
          icon={<Type className="h-5 w-5" />}
          label={`Text size: ${fontSizeLabel}`}
          onClick={cycleFontSize}
        />
        <FooterButton
          icon={<Contrast className="h-5 w-5" />}
          label="High contrast"
          active={highContrast}
          onClick={toggleHighContrast}
        />
        {isSpeaking && (
          <FooterButton
            icon={<VolumeX className="h-5 w-5" />}
            label="Stop reading"
            onClick={stopSpeaking}
          />
        )}
        {onNeedHelp && (
          <FooterButton
            icon={<HelpCircle className="h-5 w-5" />}
            label="Need help?"
            onClick={onNeedHelp}
          />
        )}
      </div>
    </footer>
  );
}

function FooterButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-tap items-center gap-2 rounded-md px-3 text-sm font-medium text-ink-muted hover:bg-bg",
        active && "bg-brand/10 text-brand"
      )}
      aria-pressed={active}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function ReadAloudButton({ text }: { text: string }) {
  const { speak, isSpeaking } = useAccessibility();
  return (
    <button
      onClick={() => speak(text)}
      className="inline-flex min-h-tap items-center gap-2 rounded-md border-2 border-brand px-4 text-base font-medium text-brand hover:bg-brand/5"
    >
      <Volume2 className="h-5 w-5" />
      {isSpeaking ? "Reading aloud…" : "Listen to this"}
    </button>
  );
}
