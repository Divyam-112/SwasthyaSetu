import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Star, ArrowLeft, Loader2, Building2 } from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card, Tabs } from "@/components/ui";
import { useCareTeamStore } from "@/store/careTeamStore";
import { getDoctorsByHospital } from "@/services/api/doctorService";
import type { Doctor } from "@/types/doctor";

/**
 * Second step of "send my report to a doctor": pick who, among the
 * chosen hospital's doctors. Requires a hospital already selected —
 * if a patient lands here directly (refresh, back-button weirdness),
 * they're sent back to pick one first.
 */
export function DoctorSearchPage() {
  const navigate = useNavigate();
  const selectedHospital = useCareTeamStore((state) => state.selectedHospital);
  const selectDoctor = useCareTeamStore((state) => state.selectDoctor);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSpecialty, setActiveSpecialty] = useState("all");

  useEffect(() => {
    if (!selectedHospital) return;
    setIsLoading(true);
    getDoctorsByHospital(selectedHospital.id).then((result) => {
      setDoctors(result);
      setIsLoading(false);
    });
  }, [selectedHospital]);

  const specialtyTabs = useMemo(() => {
    const unique = Array.from(new Set(doctors.map((doctor) => doctor.specialty)));
    return [{ id: "all", label: "All" }, ...unique.map((s) => ({ id: s, label: s }))];
  }, [doctors]);

  const visibleDoctors = useMemo(
    () =>
      activeSpecialty === "all"
        ? doctors
        : doctors.filter((doctor) => doctor.specialty === activeSpecialty),
    [doctors, activeSpecialty]
  );

  function handleSelect(doctor: Doctor) {
    selectDoctor(doctor);
    navigate(`/patient/doctors/${doctor.id}/send-report`);
  }

  if (!selectedHospital) {
    return (
      <KioskShell>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-base text-ink-muted">Please choose a hospital first.</p>
          <Button onClick={() => navigate("/patient/hospitals")}>Choose a Hospital</Button>
        </div>
      </KioskShell>
    );
  }

  return (
    <KioskShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Stethoscope className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Choose a Doctor</h1>
          <p className="flex items-center gap-1.5 text-base text-ink-muted">
            <Building2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {selectedHospital.name}
          </p>
        </div>

        {isLoading ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
            <p className="text-base text-ink-muted">Loading doctors…</p>
          </Card>
        ) : doctors.length === 0 ? (
          <p className="text-center text-base text-ink-muted">
            No doctors are listed for this hospital yet.
          </p>
        ) : (
          <>
            {specialtyTabs.length > 2 && (
              <Tabs
                tabs={specialtyTabs}
                activeId={activeSpecialty}
                onChange={setActiveSpecialty}
              />
            )}

            <div className="flex flex-col gap-3">
              {visibleDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  interactive
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(doctor)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSelect(doctor);
                  }}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{doctor.name}</h2>
                    <p className="text-sm text-ink-muted">
                      {doctor.specialty} • {doctor.yearsExperience} yrs experience
                    </p>
                  </div>
                  <span className="flex flex-shrink-0 items-center gap-1 text-sm font-medium text-ink-muted">
                    <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                    {doctor.rating.toFixed(1)}
                  </span>
                </Card>
              ))}
            </div>
          </>
        )}

        <div>
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/patient/hospitals")}
          >
            Back
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
