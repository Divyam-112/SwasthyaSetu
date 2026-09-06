// TODO: replace mock implementation with real FastAPI/backend calls via
// apiRequest(). Keep the exported function names and shapes stable —
// InterviewPage depends on these signatures, not on how they're
// implemented.
import { mockDelay } from "@/services/mocks/mockDelay";
import { INTERVIEW_QUESTIONS } from "@/services/mocks/mockInterviewFlow";
import type { InterviewAnswer, InterviewQuestion } from "@/types/interview";
// import { apiRequest } from "./client"; // uncomment when wiring the real backend call

/**
 * Returns the question flow for the AI Health Interview.
 *
 * MOCK IMPLEMENTATION — returns a fixed list. A real AI-driven
 * interview (see the SwasthyaSetu backend's `getNextQuestion`) would
 * instead return ONE question at a time, generated from the
 * conversation so far — this function's shape would then change to
 * `getNextQuestion(history): Promise<InterviewQuestion>`. Keeping that
 * change isolated to this file is exactly why InterviewPage only
 * calls functions from this module.
 */
export async function getInterviewQuestions(): Promise<InterviewQuestion[]> {
  return mockDelay(INTERVIEW_QUESTIONS, 400);
}

export interface SavedInterview {
  patientId: string;
  answers: InterviewAnswer[];
  submittedAt: string;
}

/**
 * Persists the patient's completed interview answers.
 *
 * MOCK IMPLEMENTATION — does not persist anywhere real yet.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<SavedInterview>(`/sessions/${sessionId}/conversation`, {
 *     method: "POST",
 *     body: JSON.stringify({ answers }),
 *   });
 */
export async function saveInterviewAnswers(
  patientId: string,
  answers: InterviewAnswer[]
): Promise<SavedInterview> {
  return mockDelay(
    {
      patientId,
      answers,
      submittedAt: new Date().toISOString(),
    },
    900
  );
}
