import React from "react";
import { cn } from "@/utils/cn";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 border-b border-border overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-h-tap px-4 whitespace-nowrap text-base font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
