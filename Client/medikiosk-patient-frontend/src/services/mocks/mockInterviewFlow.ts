import type { InterviewQuestion } from "@/types/interview";

/**
 * Fixed mock question set standing in for a real AI-driven interview.
 * Covers exactly the 8 topics the patient-side interview is required
 * to gather: chief complaint, onset, severity, past conditions,
 * current medicines, allergies, previous treatment, and other
 * relevant history. A real implementation would generate/branch
 * questions dynamically (see the SwasthyaSetu backend's aiService) —
 * swapping this file for a live call is the only change needed;
 * InterviewPage only ever deals with InterviewQuestion objects.
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "chief-complaint",
    question: "What's the main problem you'd like to see the doctor about today?",
    type: "text",
    helperText: "Describe it in your own words — for example, \"stomach pain\" or \"fever and cough.\"",
    allowSkip: false,
    simulatedVoiceAnswer: "I've had a bad headache since yesterday.",
  },
  {
    id: "onset",
    question: "When did this start?",
    type: "single-choice",
    options: [
      "Today",
      "1–3 days ago",
      "About a week ago",
      "Several weeks ago",
      "More than a month ago",
    ],
  },
  {
    id: "severity",
    question: "How severe would you say it is right now?",
    type: "single-choice",
    options: [
      "Mild — barely noticeable",
      "Moderate — noticeable but manageable",
      "Severe — hard to ignore",
      "Very severe — worst I've felt",
    ],
  },
  {
    id: "past-conditions",
    question: "Do you have any of these ongoing health conditions?",
    type: "multiple-choice",
    options: [
      "Diabetes",
      "High blood pressure",
      "Heart disease",
      "Asthma",
      "Thyroid condition",
      "None of these",
    ],
  },
  {
    id: "current-medicines",
    question: "Are you currently taking any medicines — including over-the-counter or herbal ones?",
    type: "text",
    helperText: "Include the name and how often you take it, if you remember.",
    quickReplies: ["Not taking any medicines"],
    simulatedVoiceAnswer: "I take one blood pressure tablet every morning.",
  },
  {
    id: "allergies",
    question: "Do you have any allergies — to medicines, food, or anything else?",
    type: "text",
    quickReplies: ["No known allergies"],
    simulatedVoiceAnswer: "I'm allergic to penicillin.",
  },
  {
    id: "previous-treatments",
    question: "Have you had any treatment, surgery, or hospital visit for this or a related issue before?",
    type: "text",
    quickReplies: ["No previous treatment for this"],
    simulatedVoiceAnswer: "I was in the hospital for the same issue two years ago.",
  },
  {
    id: "medical-history",
    question:
      "Is there anything else in your medical history your doctor should know — for example, a family history of a major illness?",
    type: "text",
    quickReplies: ["Nothing else to add"],
    simulatedVoiceAnswer: "My father has diabetes and heart disease.",
  },
];
