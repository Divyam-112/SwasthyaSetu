import React from "react";

interface InterviewProgressProps {
  /** 1-based index of the question currently on screen. */
  current: number;
  total: number;
}

export function InterviewProgress({ current, total }: InterviewProgressProps) {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-muted">
          Question {current} of {total}
        </span>
        <span className="text-sm font-medium text-ink-muted">{percent}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Interview progress"
      >
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
