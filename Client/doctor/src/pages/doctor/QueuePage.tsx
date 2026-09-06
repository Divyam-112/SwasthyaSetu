import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
  Eye,
  Play,
  CheckSquare,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/cn";
import {
  fetchDoctorQueue,
  updateAppointmentStatus,
  type QueueEntry,
} from "@/services/api/doctorService";

type FilterTab = "all" | "booked" | "in_progress" | "completed" | "flagged";

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "booked", label: "Waiting" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "flagged", label: "Flagged" },
];

function statusBadge(status: string) {
  if (status === "completed")
    return <Badge tone="success">Completed</Badge>;
  if (status === "in_progress")
    return <Badge tone="warning">In Progress</Badge>;
  if (status === "booked") return <Badge tone="pending">Waiting</Badge>;
  if (status === "no_show") return <Badge tone="warning">No Show</Badge>;
  return <Badge tone="pending">{status}</Badge>;
}

export function QueuePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueue = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchDoctorQueue();
      setQueue(data.queue);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load queue"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const total = queue.length;
  const completed = queue.filter(
    (p) => p.appointmentStatus === "completed"
  ).length;
  const waiting = queue.filter(
    (p) => p.appointmentStatus === "booked"
  ).length;
  const flagged = queue.filter((p) => p.hasRedFlags).length;

  const filtered =
    activeFilter === "all"
      ? queue
      : activeFilter === "flagged"
        ? queue.filter((p) => p.hasRedFlags)
        : queue.filter((p) => p.appointmentStatus === activeFilter);

  async function handleStartAppointment(appointmentId: string) {
    try {
      await updateAppointmentStatus(appointmentId, "in_progress");
      loadQueue(true);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to start appointment"
      );
    }
  }

  async function handleCompleteAppointment(appointmentId: string) {
    try {
      await updateAppointmentStatus(appointmentId, "completed");
      loadQueue(true);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to complete appointment"
      );
    }
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
          label="Completed"
          value={completed}
          valueClass="text-success"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-ink-muted" />}
          label="Waiting"
          value={waiting}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-accent" />}
          label="Red Flags"
          value={flagged}
          valueClass={flagged > 0 ? "text-accent" : "text-ink"}
        />
      </div>

      {/* Refresh button */}
      <div className="mb-4 flex items-center justify-between">
        {/* Filter tabs */}
        <div
          role="tablist"
          className="flex gap-1 border-b border-border overflow-x-auto"
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

        <button
          onClick={() => loadQueue(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-bg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <span className="ml-3 text-ink-muted">Loading queue...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-accent" />
          <p className="text-ink-muted">{error}</p>
          <button
            onClick={() => loadQueue()}
            className="text-brand underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Queue table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-md border border-border bg-surface">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left">
                  <th className="px-4 py-3 font-semibold text-ink-muted">
                    Token
                  </th>
                  <th className="px-4 py-3 font-semibold text-ink-muted">
                    Patient
                  </th>
                  <th className="px-4 py-3 font-semibold text-ink-muted">
                    Chief Complaint
                  </th>
                  <th className="px-4 py-3 font-semibold text-ink-muted">
                    Summary
                  </th>
                  <th className="px-4 py-3 font-semibold text-ink-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-ink-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-ink-muted"
                    >
                      No patients in this category.
                    </td>
                  </tr>
                )}
                {filtered.map((entry) => (
                  <tr
                    key={entry.appointmentId}
                    className={cn(
                      "transition-colors hover:bg-bg",
                      entry.hasRedFlags &&
                        "border-l-4 border-l-accent"
                    )}
                  >
                    {/* Token number */}
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                        {entry.tokenNumber}
                      </span>
                    </td>

                    {/* Patient info */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">
                        {entry.patientName}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {entry.age ? `${entry.age}y` : ""}
                        {entry.gender ? ` · ${entry.gender}` : ""}
                        {entry.abhaId ? ` · ${entry.abhaId}` : ""}
                      </p>
                    </td>

                    {/* Chief complaint */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-ink leading-snug line-clamp-2">
                        {entry.chiefComplaint}
                      </p>
                    </td>

                    {/* Summary status */}
                    <td className="px-4 py-3">
                      {entry.hasSummary ? (
                        entry.hasRedFlags ? (
                          <Badge tone="warning">
                            Needs Review
                          </Badge>
                        ) : (
                          <Badge tone="success">Ready</Badge>
                        )
                      ) : (
                        <Badge tone="pending">Pending</Badge>
                      )}
                    </td>

                    {/* Appointment status */}
                    <td className="px-4 py-3">
                      {statusBadge(entry.appointmentStatus)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.hasSummary && (
                          <button
                            onClick={() =>
                              navigate(
                                `/doctor/patients/${entry.sessionId}/report`
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/5 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        )}
                        {entry.appointmentStatus === "booked" && (
                          <button
                            onClick={() =>
                              handleStartAppointment(
                                entry.appointmentId
                              )
                            }
                            title="Start appointment"
                            className="rounded-md p-1.5 text-ink-muted hover:bg-brand/10 hover:text-brand transition-colors"
                            aria-label="Start appointment"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {entry.appointmentStatus === "in_progress" && (
                          <button
                            onClick={() =>
                              handleCompleteAppointment(
                                entry.appointmentId
                              )
                            }
                            title="Mark as completed"
                            className="rounded-md p-1.5 text-ink-muted hover:bg-success/10 hover:text-success transition-colors"
                            aria-label="Mark as completed"
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
            Showing {filtered.length} of {total} patients · Last
            refreshed just now
          </p>
        </>
      )}
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
      <p className={cn("text-2xl font-semibold text-ink", valueClass)}>
        {value}
      </p>
    </div>
  );
}
