import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Star, ArrowLeft, Loader2, Search } from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { useCareTeamStore } from "@/store/careTeamStore";
import { getHospitals } from "@/services/api/hospitalService";
import type { Hospital } from "@/types/hospital";

/**
 * First step of "send my report to a doctor": pick which hospital.
 * Selecting one narrows DoctorSearchPage down to that hospital's
 * doctors — a patient can't pick a doctor without a hospital first.
 */
export function HospitalSelectionPage() {
  const navigate = useNavigate();
  const selectHospital = useCareTeamStore((state) => state.selectHospital);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getHospitals().then((result) => {
      setHospitals(result);
      setIsLoading(false);
    });
  }, []);

  const filteredHospitals = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return hospitals;
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(trimmed) ||
        hospital.departments.some((dept) => dept.toLowerCase().includes(trimmed))
    );
  }, [hospitals, query]);

  function handleSelect(hospital: Hospital) {
    selectHospital(hospital);
    navigate("/patient/doctors");
  }

  return (
    <KioskShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Building2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Choose a Hospital</h1>
          <p className="max-w-lg text-base text-ink-muted">
            Select the hospital where you'd like to send your verified report. You'll pick a
            doctor there next.
          </p>
        </div>

        <Input
          label="Search by hospital or department"
          icon={<Search className="h-5 w-5" aria-hidden="true" />}
          placeholder="e.g. Apollo, Cardiology"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {isLoading ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
            <p className="text-base text-ink-muted">Finding nearby hospitals…</p>
          </Card>
        ) : filteredHospitals.length === 0 ? (
          <p className="text-center text-base text-ink-muted">
            No hospitals match "{query}". Try a different search.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredHospitals.map((hospital) => (
              <Card
                key={hospital.id}
                interactive
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(hospital)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(hospital);
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink">{hospital.name}</h2>
                  <span className="flex flex-shrink-0 items-center gap-1 text-sm font-medium text-ink-muted">
                    <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                    {hospital.rating.toFixed(1)}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {hospital.address} • {hospital.distanceKm} km away
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {hospital.departments.map((dept) => (
                    <span
                      key={dept}
                      className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-ink-muted"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div>
          <Button
            variant="outline"
            size="kiosk"
            icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate("/patient/verification")}
          >
            Back
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}
