import React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  errorText?: string;
  icon?: React.ReactNode;
}

/**
 * Labels are always visible above the field (never placeholder-only —
 * placeholders disappear the moment someone starts typing, which is
 * disorienting for a first-time or low-literacy user).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, helperText, errorText, icon, className, id, ...props },
    ref
  ) => {
    const inputId = id ?? React.useId();
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-base font-medium text-ink mb-2"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full min-h-tap rounded-md border-2 bg-surface px-4 text-base text-ink placeholder:text-ink-muted",
              "border-border focus:border-brand focus:outline-none",
              icon && "pl-11",
              errorText && "border-error",
              className
            )}
            aria-invalid={!!errorText}
            aria-describedby={
              errorText ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined
            }
            {...props}
          />
        </div>
        {errorText ? (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-error font-medium">
            {errorText}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-help`} className="mt-2 text-sm text-ink-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
