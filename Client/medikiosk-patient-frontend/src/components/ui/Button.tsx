import React from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "default" | "kiosk"; // kiosk = extra-large, for first-touch screens

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Icon shown before the label. Buttons should almost always carry a label too. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark active:bg-brand-dark",
  secondary:
    "bg-surface text-brand border-2 border-brand hover:bg-bg active:bg-bg",
  outline:
    "bg-transparent text-ink border-2 border-border hover:border-ink-muted",
  danger: "bg-error text-white hover:opacity-90",
  ghost: "bg-transparent text-brand hover:bg-bg",
};

// Kiosk size is deliberately much larger than a typical web default —
// a nervous first-time patient should never have to squint or aim carefully.
const sizeClasses: Record<Size, string> = {
  default: "min-h-tap px-5 py-3 text-base rounded-md",
  kiosk: "min-h-[64px] px-8 py-4 text-lg rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      icon,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
