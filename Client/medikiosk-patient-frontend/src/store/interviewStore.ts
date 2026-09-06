import { create } from "zustand";
import type { InterviewAnswer } from "@/types/interview";

interface InterviewState {
  currentIndex: number;
  answers: InterviewAnswer[];
  /** Records (or overwrites, if the patient went back and changed it)
   * the answer for the current question, then advances. */
  recordAnswer: (answer: InterviewAnswer) => void;
  goToPrevious: () => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  currentIndex: 0,
  answers: [],
  recordAnswer: (answer) =>
    set((state) => {
      const existingIndex = state.answers.findIndex(
        (a) => a.questionId === answer.questionId
      );
      const answers =
        existingIndex >= 0
          ? state.answers.map((a, i) => (i === existingIndex ? answer : a))
          : [...state.answers, answer];
      return { answers, currentIndex: state.currentIndex + 1 };
    }),
  goToPrevious: () =>
    set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
  reset: () => set({ currentIndex: 0, answers: [] }),
}));
