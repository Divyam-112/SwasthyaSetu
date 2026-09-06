import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  options: SelectOption[];
  helperText?: string;
  errorText?: string;
}

/** Styled to match Input exactly so a mixed-field form (like signup)
 * reads as one consistent set of controls, not two different kits. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, errorText, className, id, ...props }, ref) => {
    const selectId = id ?? React.useId();
    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="block text-base font-medium text-ink mb-2"
        >
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full min-h-tap appearance-none rounded-md border-2 bg-surface px-4 pr-11 text-base text-ink",
              "border-border focus:border-brand focus:outline-none",
              errorText && "border-error",
              className
            )}
            aria-invalid={!!errorText}
            aria-describedby={
              errorText ? `${selectId}-error` : helperText ? `${selectId}-help` : undefined
            }
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
        </div>
        {errorText ? (
          <p id={`${selectId}-error`} className="mt-2 text-sm text-error font-medium">
            {errorText}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-help`} className="mt-2 text-sm text-ink-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
