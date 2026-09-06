import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: string;
}

/**
 * The whole row is clickable, not just the small box — important for
 * patients with limited dexterity or anyone using this on a kiosk
 * touchscreen at arm's length.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, checked, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-start gap-3 min-h-tap cursor-pointer select-none py-2",
          className
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 transition-colors",
            checked
              ? "bg-brand border-brand"
              : "bg-surface border-border"
          )}
          aria-hidden="true"
        >
          {checked && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
        </span>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          className="sr-only"
          {...props}
        />
        <span>
          <span className="text-base text-ink font-medium">{label}</span>
          {description && (
            <span className="block text-sm text-ink-muted mt-0.5">
              {description}
            </span>
          )}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
