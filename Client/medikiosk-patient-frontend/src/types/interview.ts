export type InterviewQuestionType = "text" | "single-choice" | "multiple-choice";

export interface InterviewQuestion {
  id: string;
  question: string;
  type: InterviewQuestionType;
  /** Answer choices — used for "single-choice" and "multiple-choice" only. */
  options?: string[];
  /** Short one-tap suggestions shown next to a "text" question (e.g. "No known allergies"). */
  quickReplies?: string[];
  /** A brief clarifying line shown under the question — units, examples, etc. */
  helperText?: string;
  /** Whether "I don't know / Prefer not to answer" is offered. Defaults to true. */
  allowSkip?: boolean;
  /**
   * DEMO ONLY: what the mock microphone "hears" when tapped on this
   * question. Delete this field once real speech-to-text is wired in —
   * see services/speechInputService.ts.
   */
  simulatedVoiceAnswer?: string;
}

export interface InterviewAnswer {
  questionId: string;
  /** Empty string ("") or empty array ([]) when the patient skipped the question. */
  value: string | string[];
  skipped: boolean;
  /** How the patient actually provided this specific answer. */
  inputMode: "text" | "voice" | "choice";
  answeredAt: string;
}
