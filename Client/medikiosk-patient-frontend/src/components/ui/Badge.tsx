import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

type Tone = "success" | "pending" | "warning" | "error" | "neutral";

interface BadgeProps {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}

const toneConfig: Record<Tone, { classes: string; icon: React.ElementType }> = {
  success: {
    classes: "bg-success/10 text-success border-success/30",
    icon: CheckCircle2,
  },
  pending: {
    classes: "bg-ink-muted/10 text-ink-muted border-ink-muted/30",
    icon: Clock,
  },
  warning: {
    classes: "bg-accent/10 text-accent border-accent/30",
    icon: AlertTriangle,
  },
  error: {
    classes: "bg-error/10 text-error border-error/30",
    icon: XCircle,
  },
  neutral: {
    classes: "bg-brand/10 text-brand border-brand/30",
    icon: Info,
  },
};

/** Status pill: color is always paired with an icon and a text label. */
export function Badge({ tone, children, className }: BadgeProps) {
  const { classes, icon: Icon } = toneConfig[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
        classes,
        className
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </span>
  );
}
