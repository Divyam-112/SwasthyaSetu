import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, ClipboardList, Loader2 } from "lucide-react";
import { KioskShell } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { ONBOARDING_STEPS } from "@/app/routes";
import { useSessionStore } from "@/store/sessionStore";
import { useInterviewStore } from "@/store/interviewStore";
import { getInterviewQuestions, saveInterviewAnswers } from "@/services/api/interviewService";
import type { InterviewAnswer, InterviewQuestion } from "@/types/interview";
import { InterviewProgress } from "./components/InterviewProgress";
import { QuestionCard } from "./components/QuestionCard";
import { ChoiceButtons } from "./components/ChoiceButtons";
import { VoiceTextAnswer } from "./components/VoiceTextAnswer";
import { ExitInterviewModal } from "./components/ExitInterviewModal";
import { InterviewCompletion } from "./components/InterviewCompletion";

/**
 * MOCK AI interview. This screen (and everything it calls) only
 * collects medical history — it never diagnoses, prescribes, or
 * recommends treatment. Real question generation would replace
 * getInterviewQuestions() in services/api/interviewService.ts; this
 * page doesn't change either way.
 */
export function InterviewPage() {
  const navigate = useNavigate();
  const patient = useSessionStore((state) => state.patient);
  const { currentIndex, answers, recordAnswer, goToPrevious, reset } = useInterviewStore();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [pendingText, setPendingText] = useState("");
  const [pendingChoice, setPendingChoice] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInterviewQuestions().then((result) => {
      if (!cancelled) {
        setQuestions(result);
        setIsLoadingQuestions(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const isComplete = !isLoadingQuestions && questions.length > 0 && currentIndex >= questions.length;

  // Pre-fill from a previously given answer whenever the visible
  // question changes, so going Back to correct something shows what
  // was actually said rather than a blank field.
  useEffect(() => {
    if (!currentQuestion) {
      setPendingText("");
      setPendingChoice([]);
      return;
    }
    const existing = answers.find((a) => a.questionId === currentQuestion.id);
    if (!existing || existing.skipped) {
      setPendingText("");
      setPendingChoice([]);
      return;
    }
    if (Array.isArray(existing.value)) {
      setPendingChoice(existing.value);
      setPendingText("");
    } else {
      setPendingText(existing.value);
      setPendingChoice([]);
    }
  }, [currentIndex, currentQuestion, answers]);

  function submitAnswer(
    value: string | string[],
    inputMode: InterviewAnswer["inputMode"],
    skipped = false
  ) {
    if (!currentQuestion) return;
    recordAnswer({
      questionId: currentQuestion.id,
      value: skipped ? (currentQuestion.type === "multiple-choice" ? [] : "") : value,
      skipped,
      inputMode,
      answeredAt: new Date().toISOString(),
    });
  }

  function handleBack() {
    if (currentIndex > 0) {
      goToPrevious();
    } else {
      navigate("/patient/consent");
    }
  }

  function handleConfirmExit() {
    reset();
    setShowExitModal(false);
    navigate("/");
  }

  async function handleFinishInterview() {
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveInterviewAnswers(patient?.id ?? "unknown-patient", answers);
      navigate("/patient/documents");
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Something went wrong saving your answers. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const answeredCount = answers.filter((a) => !a.skipped).length;
  const skippedCount = answers.filter((a) => a.skipped).length;

  return (
    <KioskShell steps={ONBOARDING_STEPS} currentStepId="interview">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <ClipboardList className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-ink">Health Interview</h1>
          <p className="max-w-lg text-base text-ink-muted">
            A few quick questions to help your doctor understand what's going
            on. This only gathers information — it does not diagnose or
            suggest treatment.
          </p>
        </div>

        {isLoadingQuestions && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
            <p className="text-base text-ink-muted">Preparing your interview…</p>
          </Card>
        )}

        {!isLoadingQuestions && !isComplete && currentQuestion && (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex min-h-tap items-center gap-1.5 rounded-md px-2 text-base font-medium text-ink-muted hover:text-ink"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="inline-flex min-h-tap items-center gap-1.5 rounded-md px-2 text-base font-medium text-ink-muted hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                Exit
              </button>
            </div>

            <InterviewProgress current={currentIndex + 1} total={questions.length} />

            <Card className="flex flex-col gap-6">
              <QuestionCard question={currentQuestion.question} helperText={currentQuestion.helperText} />

              {currentQuestion.type === "single-choice" && (
                <ChoiceButtons
                  options={currentQuestion.options ?? []}
                  mode="single"
                  selected={pendingChoice}
                  onSelect={(values) => submitAnswer(values[0] ?? "", "choice")}
                />
              )}

              {currentQuestion.type === "multiple-choice" && (
                <>
                  <ChoiceButtons
                    options={currentQuestion.options ?? []}
                    mode="multiple"
                    selected={pendingChoice}
                    onSelect={setPendingChoice}
                  />
                  <Button
                    size="kiosk"
                    onClick={() => submitAnswer(pendingChoice, "choice")}
                    disabled={pendingChoice.length === 0}
                  >
                    Continue
                  </Button>
                </>
              )}

              {currentQuestion.type === "text" && (
                <>
                  <VoiceTextAnswer
                    value={pendingText}
                    onChange={setPendingText}
                    onQuickReply={(reply) => submitAnswer(reply, "text")}
                    quickReplies={currentQuestion.quickReplies}
                    simulatedVoiceAnswer={currentQuestion.simulatedVoiceAnswer}
                  />
                  <Button
                    size="kiosk"
                    onClick={() => submitAnswer(pendingText.trim(), "text")}
                    disabled={pendingText.trim().length === 0}
                  >
                    Continue
                  </Button>
                </>
              )}

              {currentQuestion.allowSkip !== false && (
                <button
                  type="button"
                  onClick={() =>
                    submitAnswer(
                      currentQuestion.type === "multiple-choice" ? [] : "",
                      currentQuestion.type === "text" ? "text" : "choice",
                      true
                    )
                  }
                  className="self-center text-sm font-medium text-ink-muted underline underline-offset-2 hover:text-ink"
                >
                  I don't know / Prefer not to answer
                </button>
              )}
            </Card>
          </>
        )}

        {isComplete && (
          <InterviewCompletion
            answeredCount={answeredCount}
            skippedCount={skippedCount}
            isSaving={isSaving}
            saveError={saveError}
            onContinue={handleFinishInterview}
          />
        )}
      </div>

      <ExitInterviewModal
        open={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </KioskShell>
  );
}
