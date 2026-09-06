import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Cross,
  LayoutDashboard,
  Search,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useDoctorSessionStore } from "@/store/doctorSessionStore";
import { cn } from "@/utils/cn";

interface DoctorShellProps {
  children: React.ReactNode;
  pageTitle: string;
}

const navItems = [
  { to: "/doctor/dashboard", icon: LayoutDashboard, label: "Today's Queue" },
  { to: "/doctor/search", icon: Search, label: "Patient Search" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/records", icon: FileText, label: "Records" },
];

/**
 * Two-column layout for all doctor-side screens.
 * Left: fixed sidebar with nav + doctor identity.
 * Right: scrollable content area with a top bar.
 */
export function DoctorShell({ children, pageTitle }: DoctorShellProps) {
  const doctor = useDoctorSessionStore((s) => s.doctor);
  const logout = useDoctorSessionStore((s) => s.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-ink/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-border bg-surface transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white flex-shrink-0">
            <Cross className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-ink leading-tight">MediKiosk</p>
            <p className="text-xs text-ink-muted leading-tight">Doctor Portal</p>
          </div>
          <button
            className="ml-auto rounded p-1 text-ink-muted hover:bg-bg lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "text-ink-muted hover:bg-bg hover:text-ink"
                    )
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Doctor identity + Logout */}
        <div className="border-t border-border p-4">
          {doctor && (
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white text-sm font-semibold flex-shrink-0">
                {doctor.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{doctor.name}</p>
                <p className="truncate text-xs text-ink-muted">{doctor.specialization}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-bg hover:text-error transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-ink-muted hover:bg-bg lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-ink">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-ink-muted sm:block">{dateStr}</p>
            <button
              className="relative rounded-md p-2 text-ink-muted hover:bg-bg"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
