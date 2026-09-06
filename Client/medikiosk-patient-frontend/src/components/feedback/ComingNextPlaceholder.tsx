import React from "react";
import { Construction } from "lucide-react";
import { Card } from "@/components/ui";

interface ComingNextPlaceholderProps {
  title: string;
  description: string;
}

/**
 * Temporary stand-in for a page that hasn't been built yet. Used so
 * routing/navigation can be exercised end-to-end before every step
 * is implemented, without faking finished UI.
 */
export function ComingNextPlaceholder({
  title,
  description,
}: ComingNextPlaceholderProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Construction className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="max-w-md text-base text-ink-muted">{description}</p>
    </Card>
  );
}
