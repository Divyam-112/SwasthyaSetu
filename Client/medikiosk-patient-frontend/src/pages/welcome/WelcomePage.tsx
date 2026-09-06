import React from "react";
import { useNavigate } from "react-router-dom";
import { Cross, UserRound, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui";
import { AccessibleFooter } from "@/components/layout";

/**
 * The very first screen a patient sees, often unassisted at a kiosk.
 * Exactly one decision, two large, unmistakable options — nothing
 * else competes for attention.
 */
export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand text-white mb-6">
          <Cross className="h-9 w-9" />
        </div>
        <h1 className="text-3xl font-semibold text-ink text-center">
          Welcome to MediKiosk
        </h1>
        <p className="mt-3 max-w-md text-center text-lg text-ink-muted">
          Please tell us who you are, so we can take you to the right place.
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
          <RoleCard
            icon={<UserRound className="h-8 w-8" />}
            title="I am a Patient"
            description="Check in, share your medical history, and see a doctor."
            onClick={() => navigate("/patient/login")}
          />
          <RoleCard
            icon={<Stethoscope className="h-8 w-8" />}
            title="I am a Doctor"
            description="Review patient reports and manage appointments."
            onClick={() => navigate("/doctor")}
          />
        </div>
      </main>
      <AccessibleFooter />
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      interactive
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </span>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="text-base text-ink-muted">{description}</p>
    </Card>
  );
}
