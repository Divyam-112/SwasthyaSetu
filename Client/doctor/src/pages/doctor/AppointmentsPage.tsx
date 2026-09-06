import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/cn";
import {
  fetchDoctorQueue,
  type QueueEntry,
} from "@/services/api/doctorService";

const TODAY = new Date();

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function statusBadge(status: string) {
  if (status === "booked")
    return <Badge tone="pending">Waiting</Badge>;
  if (status === "in_progress")
    return <Badge tone="warning">In Progress</Badge>;
  if (status === "completed")
    return <Badge tone="success">Completed</Badge>;
  if (status === "cancelled")
    return <Badge tone="error">Cancelled</Badge>;
  if (status === "no_show")
    return <Badge tone="warning">No Show</Badge>;
  return <Badge tone="pending">{status}</Badge>;
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [appointments, setAppointments] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache: store appointments per date string
  const [dateCache, setDateCache] = useState<
    Record<string, QueueEntry[]>
  >({});

  const loadAppointments = useCallback(
    async (date: Date) => {
      const dateStr = toDateString(date);

      // Check cache first
      if (dateCache[dateStr]) {
        setAppointments(dateCache[dateStr]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Fetch all statuses for this date
        const data = await fetchDoctorQueue(dateStr);
        setAppointments(data.queue);
        setDateCache((prev) => ({
          ...prev,
          [dateStr]: data.queue,
        }));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load appointments"
        );
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [dateCache]
  );

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate, loadAppointments]);

  // Week view — 7 days starting Monday of the current week
  const dayOfWeek = selectedDate.getDay();
  const monday = addDays(
    selectedDate,
    dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  );
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(monday, i)
  );

  const booked = appointments.filter(
    (a) => a.appointmentStatus === "booked"
  ).length;
  const inProgress = appointments.filter(
    (a) => a.appointmentStatus === "in_progress"
  ).length;
  const completed = appointments.filter(
    (a) => a.appointmentStatus === "completed"
  ).length;

  return (
    <DoctorShell pageTitle="Appointments">
      {/* Week strip */}
      <div className="mb-5 rounded-md border border-border bg-surface p-3 overflow-x-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() =>
              setSelectedDate((d) => addDays(d, -7))
            }
            className="rounded-md p-1 text-ink-muted hover:bg-bg"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-ink">
            Week of{" "}
            {monday.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <button
            onClick={() =>
              setSelectedDate((d) => addDays(d, 7))
            }
            className="rounded-md p-1 text-ink-muted hover:bg-bg"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 min-w-[560px]">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, TODAY);
            const cachedAppts =
              dateCache[toDateString(day)];
            const dayCount = cachedAppts
              ? cachedAppts.length
              : undefined;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md p-2 text-center transition-colors",
                  isSelected
                    ? "bg-brand text-white"
                    : isToday
                      ? "border border-brand text-brand"
                      : "hover:bg-bg text-ink-muted"
                )}
              >
                <span className="text-xs font-medium">
                  {day.toLocaleDateString("en-IN", {
                    weekday: "short",
                  })}
                </span>
                <span
                  className={cn(
                    "text-base font-semibold",
                    isSelected ? "text-white" : "text-ink"
                  )}
                >
                  {day.getDate()}
                </span>
                {dayCount !== undefined && dayCount > 0 && (
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-brand/10 text-brand"
                    )}
                  >
                    {dayCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date heading + stats */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-sm text-ink-muted">
            {appointments.length} appointment
            {appointments.length !== 1 ? "s" : ""}
            {booked > 0 && ` · ${booked} waiting`}
            {inProgress > 0 && ` · ${inProgress} in progress`}
            {completed > 0 && ` · ${completed} completed`}
          </p>
        </div>
        <button
          onClick={() => {
            // Clear cache for this date to force refresh
            const dateStr = toDateString(selectedDate);
            setDateCache((prev) => {
              const next = { ...prev };
              delete next[dateStr];
              return next;
            });
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-bg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <span className="ml-3 text-ink-muted">
            Loading appointments...
          </span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-accent" />
          <p className="text-ink-muted">{error}</p>
        </div>
      )}

      {/* Appointments list */}
      {!loading && !error && (
        <>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Clock className="h-7 w-7" />
              </span>
              <p className="text-lg font-semibold text-ink">
                No appointments
              </p>
              <p className="text-base text-ink-muted">
                No appointments scheduled for this date.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {appointments.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-4 rounded-md border bg-surface p-4 shadow-card transition-colors",
                    appt.appointmentStatus === "cancelled"
                      ? "border-border opacity-60"
                      : "border-border hover:border-brand/50"
                  )}
                >
                  {/* Token + Patient info */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 text-center w-14">
                      <span className="flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                        {appt.tokenNumber}
                      </span>
                      <p className="text-xs text-ink-muted mt-1">
                        Token
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="font-semibold text-ink">
                        {appt.patientName}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {appt.age ? `${appt.age}y` : ""}
                        {appt.gender
                          ? ` · ${appt.gender}`
                          : ""}
                        {appt.chiefComplaint
                          ? ` · ${appt.chiefComplaint}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Status + action */}
                  <div className="flex items-center gap-3">
                    {statusBadge(appt.appointmentStatus)}
                    {appt.appointmentStatus !== "cancelled" &&
                      appt.hasSummary && (
                        <button
                          onClick={() =>
                            navigate(
                              `/doctor/patients/${appt.sessionId}/report`
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/5 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DoctorShell>
  );
}
