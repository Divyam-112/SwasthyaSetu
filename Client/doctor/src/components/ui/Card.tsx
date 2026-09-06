import React from "react";
import { cn } from "@/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Removes padding for cards that manage their own inner layout. */
  noPadding?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  noPadding,
  interactive,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "card bg-surface border border-border rounded-md shadow-card",
        !noPadding && "p-5",
        interactive &&
          "cursor-pointer transition-colors hover:border-brand focus-visible:border-brand",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-ink", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-ink-muted mt-1", className)} {...props}>
      {children}
    </p>
  );
}
