import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface ChoiceButtonsProps {
  options: string[];
  mode: "single" | "multiple";
  selected: string[];
  /**
   * For "single": called with exactly one option the moment it's
   * tapped — the parent treats this as an immediate answer.
   * For "multiple": called with the full updated selection on every
   * tap — the parent still needs an explicit Continue action.
   */
  onSelect: (options: string[]) => void;
}

/** An option whose label starts with "none" clears/blocks every other
 * selection in multi-select mode — e.g. "None of these" for a
 * conditions checklist. */
function isExclusiveOption(option: string): boolean {
  return option.trim().toLowerCase().startsWith("none");
}

export function ChoiceButtons({ options, mode, selected, onSelect }: ChoiceButtonsProps) {
  function handleTap(option: string) {
    if (mode === "single") {
      onSelect([option]);
      return;
    }

    if (isExclusiveOption(option)) {
      onSelect(selected.includes(option) ? [] : [option]);
      return;
    }

    const withoutExclusive = selected.filter((item) => !isExclusiveOption(item));
    const next = withoutExclusive.includes(option)
      ? withoutExclusive.filter((item) => item !== option)
      : [...withoutExclusive, option];
    onSelect(next);
  }

  return (
    <div
      className="flex flex-wrap gap-2.5"
      role={mode === "single" ? "radiogroup" : "group"}
      aria-label="Answer options"
    >
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => handleTap(option)}
            className={cn(
              "inline-flex min-h-tap items-center gap-2 rounded-full border-2 px-5 text-base font-medium transition-colors",
              isSelected
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-ink hover:border-brand/50"
            )}
          >
            {isSelected && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}
