export interface InterviewQuestion {
  id: string;
  text: string;
  type: "text" | "single-select" | "multi-select" | "yes-no";
  options?: string[];
}

export interface InterviewAnswer {
  questionId: string;
  value: string | string[];
}
