import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { DoctorShell } from "@/components/layout";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/cn";

type ApptStatus = "confirmed" | "pending" | "cancelled";

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  reason: string;
  status: ApptStatus;
  duration: number; // minutes
}

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

/** Generate mock appointments for ±7 days around today */
function generateAppointments(): Appointment[] {
  const templates: Omit<Appointment, "id" | "time">[] = [
    { patientName: "Asha Verma", patientId: "mock-patient-demo1", age: 34, gender: "female", reason: "Follow-up — Fever", status: "confirmed", duration: 15 },
    { patientName: "Ramesh Nair", patientId: "mock-patient-demo2", age: 61, gender: "male", reason: "Cardiac review", status: "confirmed", duration: 20 },
    { patientName: "Sunita Devi", patientId: "pat-003", age: 47, gender: "female", reason: "Knee pain assessment", status: "pending", duration: 15 },
    { patientName: "Mohammed Iqbal", patientId: "pat-004", age: 29, gender: "male", reason: "Headache follow-up", status: "confirmed", duration: 10 },
    { patientName: "Kavitha Rao", patientId: "pat-005", age: 52, gender: "female", reason: "Diabetes review", status: "cancelled", duration: 20 },
    { patientName: "Geeta Mishra", patientId: "pat-007", age: 68, gender: "female", reason: "Breathlessness review", status: "confirmed", duration: 30 },
    { patientName: "Vikas Patel", patientId: "pat-008", age: 41, gender: "male", reason: "GI follow-up", status: "pending", duration: 15 },
    { patientName: "Deepak Chauhan", patientId: "pat-010", age: 55, gender: "male", reason: "Back pain MRI review", status: "confirmed", duration: 20 },
  ];

  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
  const appts: Appointment[] = [];

  // Spread appointments across ±5 days
  const offsets = [0, 0, 0, 1, 1, -1, -1, 2];
  templates.forEach((t, i) => {
    const date = addDays(TODAY, offsets[i] ?? 0);
    appts.push({
      ...t,
      id: `appt-${i}`,
      time: times[i % times.length],
    });
    // Attach a date to each so we can filter (store as ISO string in id)
    appts[appts.length - 1].id = `appt-${i}-${date.toISOString().slice(0, 10)}`;
  });

  return appts;
}

const ALL_APPTS = generateAppointments();

function statusBadge(status: ApptStatus) {
  if (status === "confirmed") return <Badge tone="success">Confirmed</Badge>;
  if (status === "pending") return <Badge tone="pending">Pending</Badge>;
  return <Badge tone="error">Cancelled</Badge>;
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(TODAY);

  // Filter appointments for selected date using the date embedded in id
  const appts = ALL_APPTS.filter((a) =>
    a.id.includes(selectedDate.toISOString().slice(0, 10))
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Week view — 7 days starting Monday of the current week
  const dayOfWeek = TODAY.getDay();
  const monday = addDays(TODAY, dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const confirmed = appts.filter((a) => a.status === "confirmed").length;
  const pending = appts.filter((a) => a.status === "pending").length;
  const cancelled = appts.filter((a) => a.status === "cancelled").length;

  return (
    <DoctorShell pageTitle="Appointments">
      {/* Week strip */}
      <div className="mb-5 rounded-md border border-border bg-surface p-3 overflow-x-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => setSelectedDate((d) => addDays(d, -7))}
            className="rounded-md p-1 text-ink-muted hover:bg-bg"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-ink">
            Week of {monday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, 7))}
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
            const dayApptCount = ALL_APPTS.filter((a) =>
              a.id.includes(day.toISOString().slice(0, 10))
            ).length;

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
                  {day.toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span className={cn("text-base font-semibold", isSelected ? "text-white" : "text-ink")}>
                  {day.getDate()}
                </span>
                {dayApptCount > 0 && (
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium",
                      isSelected ? "bg-white/20 text-white" : "bg-brand/10 text-brand"
                    )}
                  >
                    {dayApptCount}
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
          <h2 className="text-lg font-semibold text-ink">{formatDate(selectedDate)}</h2>
          <p className="text-sm text-ink-muted">
            {appts.length} appointment{appts.length !== 1 ? "s" : ""}
            {confirmed > 0 && ` · ${confirmed} confirmed`}
            {pending > 0 && ` · ${pending} pending`}
            {cancelled > 0 && ` · ${cancelled} cancelled`}
          </p>
        </div>
      </div>

      {/* Appointments list */}
      {appts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Clock className="h-7 w-7" />
          </span>
          <p className="text-lg font-semibold text-ink">No appointments</p>
          <p className="text-base text-ink-muted">No appointments scheduled for this date.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appts.map((appt) => (
            <div
              key={appt.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 rounded-md border bg-surface p-4 shadow-card transition-colors",
                appt.status === "cancelled"
                  ? "border-border opacity-60"
                  : "border-border hover:border-brand/50"
              )}
            >
              {/* Time block */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-center w-14">
                  <p className="text-base font-semibold text-brand">{appt.time}</p>
                  <p className="text-xs text-ink-muted">{appt.duration} min</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="font-semibold text-ink">{appt.patientName}</p>
                  <p className="text-sm text-ink-muted">
                    {appt.age}y · {appt.gender} · {appt.reason}
                  </p>
                </div>
              </div>

              {/* Status + action */}
              <div className="flex items-center gap-3">
                {statusBadge(appt.status)}
                {appt.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      navigate(`/doctor/patients/${appt.patientId}/report`)
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
    </DoctorShell>
  );
}
