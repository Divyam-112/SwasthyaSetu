import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
  Eye,
  CheckSquare,
  ChevronRight,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/cn";
import { mockQueue, type QueueEntry, type QueueStatus, type ReportStatus } from "@/services/mocks/mockQueue";

type FilterTab = "all" | "waiting" | "in-progress" | "flagged" | "seen";

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting" },
  { id: "in-progress", label: "In Progress" },
  { id: "flagged", label: "Flagged" },
  { id: "seen", label: "Seen" },
];

function reportStatusBadge(status: ReportStatus) {
  if (status === "verified")
    return <Badge tone="success">Verified</Badge>;
  if (status === "needs-review")
    return <Badge tone="warning">Needs Review</Badge>;
  return <Badge tone="pending">Pending</Badge>;
}

function queueStatusLabel(status: QueueStatus) {
  const map: Record<QueueStatus, { label: string; classes: string }> = {
    waiting: { label: "Waiting", classes: "text-ink-muted" },
    "in-progress": { label: "In Progress", classes: "text-brand font-semibold" },
    flagged: { label: "Flagged", classes: "text-accent font-semibold" },
    seen: { label: "Seen", classes: "text-success" },
  };
  const { label, classes } = map[status];
  return <span className={cn("text-sm", classes)}>{label}</span>;
}

export function QueuePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueEntry[]>(mockQueue);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const total = queue.length;
  const seen = queue.filter((p) => p.queueStatus === "seen").length;
  const waiting = queue.filter((p) => p.queueStatus === "waiting").length;
  const flagged = queue.filter((p) => p.queueStatus === "flagged").length;
  const avgWait = Math.round(
    queue.filter((p) => p.queueStatus === "waiting").reduce((s, p) => s + p.waitMinutes, 0) / Math.max(waiting, 1)
  );

  const filtered =
    activeFilter === "all"
      ? queue
      : queue.filter((p) => p.queueStatus === activeFilter);

  function markSeen(patientId: string) {
    setQueue((prev) =>
      prev.map((p) =>
        p.patientId === patientId ? { ...p, queueStatus: "seen" } : p
      )
    );
  }

  return (
    <DoctorShell pageTitle="Today's Queue">
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-brand" />}
          label="Total Today"
          value={total}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          label="Seen"
          value={seen}
          valueClass="text-success"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-ink-muted" />}
          label="Waiting"
          value={waiting}
        />
        <StatCard
          icon={<Timer className="h-5 w-5 text-accent" />}
          label="Avg. Wait"
          value={`${avgWait} min`}
          valueClass={avgWait > 30 ? "text-accent" : "text-ink"}
        />
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        className="mb-4 flex gap-1 border-b border-border overflow-x-auto"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              "whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeFilter === tab.id
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
            {tab.id === "flagged" && flagged > 0 && (
              <span className="ml-1.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-xs text-accent">
                {flagged}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Queue table */}
      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left">
              <th className="px-4 py-3 font-semibold text-ink-muted">#</th>
              <th className="px-4 py-3 font-semibold text-ink-muted">Patient</th>
              <th className="px-4 py-3 font-semibold text-ink-muted">Chief Complaint</th>
              <th className="px-4 py-3 font-semibold text-ink-muted">AI Report</th>
              <th className="px-4 py-3 font-semibold text-ink-muted">Status</th>
              <th className="px-4 py-3 font-semibold text-ink-muted">Wait</th>
              <th className="px-4 py-3 font-semibold text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                  No patients in this category.
                </td>
              </tr>
            )}
            {filtered.map((entry) => (
              <tr
                key={entry.patientId}
                className={cn(
                  "transition-colors hover:bg-bg",
                  entry.queueStatus === "flagged" && "border-l-4 border-l-accent"
                )}
              >
                {/* Queue number */}
                <td className="px-4 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                    {entry.queueNo}
                  </span>
                </td>

                {/* Patient info */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{entry.patientName}</p>
                  <p className="text-xs text-ink-muted">
                    {entry.age}y · {entry.gender} · {entry.abhaId}
                  </p>
                </td>

                {/* Chief complaint */}
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="text-ink leading-snug line-clamp-2">{entry.chiefComplaint}</p>
                </td>

                {/* AI report status */}
                <td className="px-4 py-3">{reportStatusBadge(entry.reportStatus)}</td>

                {/* Queue status */}
                <td className="px-4 py-3">{queueStatusLabel(entry.queueStatus)}</td>

                {/* Wait time */}
                <td className="px-4 py-3">
                  {entry.queueStatus === "seen" ? (
                    <span className="text-ink-muted">—</span>
                  ) : (
                    <span
                      className={cn(
                        "font-medium",
                        entry.waitMinutes > 30 ? "text-accent" : "text-ink-muted"
                      )}
                    >
                      {entry.waitMinutes} min
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/doctor/patients/${entry.patientId}/report`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/5 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Report
                    </button>
                    {entry.queueStatus !== "seen" && (
                      <button
                        onClick={() => markSeen(entry.patientId)}
                        title="Mark as seen"
                        className="rounded-md p-1.5 text-ink-muted hover:bg-success/10 hover:text-success transition-colors"
                        aria-label="Mark as seen"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <p className="mt-3 text-xs text-ink-muted">
        Showing {filtered.length} of {total} patients · Last refreshed just now
      </p>
    </DoctorShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={cn("text-2xl font-semibold text-ink", valueClass)}>{value}</p>
    </div>
  );
}
