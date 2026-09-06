import type { WellnessCategory, WellnessRecommendation } from "@/types/report";

/**
 * IMPORTANT: this never diagnoses anything. It only pattern-matches
 * common, well-known symptom keywords (from the patient's own words)
 * onto generic, widely-known home remedies and yoga/breathing
 * practices — no dosages, no treatment of a named condition. Every
 * suggestion is generated as a draft for a doctor to review and check
 * off (see the checkboxes on GeneratedReportPage) before it means
 * anything; nothing here is shown to the patient as medical advice.
 */

interface SymptomRecommendationSet {
  keywords: string[];
  homeRemedies: string[];
  yoga: string[];
}

const RECOMMENDATION_SETS: SymptomRecommendationSet[] = [
  {
    keywords: ["headache", "migraine"],
    homeRemedies: [
      "Apply a cold or warm compress to the forehead",
      "Rest in a quiet, dimly lit room",
      "Stay well hydrated through the day",
    ],
    yoga: ["Shavasana (Corpse Pose)", "Bhramari Pranayama (Humming Bee Breath)"],
  },
  {
    keywords: ["cold", "cough", "throat", "congestion", "sinus"],
    homeRemedies: [
      "Steam inhalation with a few drops of eucalyptus oil",
      "Warm turmeric milk before bed",
      "Gargle with warm salt water",
    ],
    yoga: ["Anulom Vilom (Alternate Nostril Breathing)", "Bhujangasana (Cobra Pose)"],
  },
  {
    keywords: ["stomach", "nausea", "digestion", "vomiting", "abdomen", "abdominal"],
    homeRemedies: [
      "Sip warm water with a pinch of ajwain (carom seeds)",
      "Ginger tea after meals",
      "Avoid heavy or oily food until symptoms settle",
    ],
    yoga: ["Vajrasana (Thunderbolt Pose) after meals", "Pawanmuktasana (Wind-Relieving Pose)"],
  },
  {
    keywords: ["fatigue", "tired", "weakness", "exhaustion"],
    homeRemedies: [
      "Maintain a consistent sleep schedule",
      "Include iron-rich foods like leafy greens in meals",
      "Take short breaks through the day rather than pushing through fatigue",
    ],
    yoga: ["A short daily walk in fresh air", "Shavasana with slow diaphragmatic breathing"],
  },
  {
    keywords: ["back", "joint", "muscle", "knee", "shoulder", "neck"],
    homeRemedies: [
      "Warm compress on the affected area",
      "Gentle stretching after periods of rest",
      "Avoid staying in one position for too long",
    ],
    yoga: ["Marjariasana–Bitilasana (Cat–Cow Stretch)", "Setu Bandhasana (Bridge Pose), if comfortable"],
  },
  {
    keywords: ["stress", "anxiety", "sleep", "insomnia"],
    homeRemedies: [
      "A warm cup of chamomile or tulsi tea before bed",
      "Limit screen time in the hour before sleep",
    ],
    yoga: ["Anulom Vilom (Alternate Nostril Breathing)", "Shavasana (Corpse Pose) for 5–10 minutes"],
  },
  {
    keywords: ["fever"],
    homeRemedies: [
      "Stay well hydrated with water and fluids",
      "Rest and avoid strenuous activity",
      "A light sponge bath if the fever feels high",
    ],
    yoga: ["Sheetali Pranayama (Cooling Breath), once the fever has settled"],
  },
];

const FALLBACK_HOME_REMEDIES = [
  "Stay well hydrated through the day",
  "Ensure adequate rest and sleep",
];
const FALLBACK_YOGA = [
  "Anulom Vilom (Alternate Nostril Breathing)",
  "A short daily walk in fresh air",
];

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function toRecommendations(
  texts: string[],
  category: WellnessCategory,
  basedOn: string
): WellnessRecommendation[] {
  return texts.map((text) => ({ id: nextId(category), category, text, basedOn }));
}

/**
 * Matches keywords across the given symptom phrases (chief complaint
 * + HPI text). Returns generic fallback suggestions if nothing
 * matches, so this section is never empty or looks broken — but
 * always framed as general wellness pointers, never as treatment for
 * a named diagnosis.
 */
export function buildWellnessRecommendations(symptomPhrases: string[]): {
  homeRemedies: WellnessRecommendation[];
  yogaExercises: WellnessRecommendation[];
} {
  idCounter = 0;
  const haystack = symptomPhrases.join(" ").toLowerCase();
  const homeRemedies: WellnessRecommendation[] = [];
  const yogaExercises: WellnessRecommendation[] = [];
  const matchedKeywords = new Set<string>();

  RECOMMENDATION_SETS.forEach((set) => {
    const matchedKeyword = set.keywords.find((keyword) => haystack.includes(keyword));
    if (!matchedKeyword) return;
    matchedKeywords.add(matchedKeyword);
    const basedOn = matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1);
    homeRemedies.push(...toRecommendations(set.homeRemedies, "home-remedy", basedOn));
    yogaExercises.push(...toRecommendations(set.yoga, "yoga", basedOn));
  });

  if (matchedKeywords.size === 0) {
    homeRemedies.push(...toRecommendations(FALLBACK_HOME_REMEDIES, "home-remedy", "General wellness"));
    yogaExercises.push(...toRecommendations(FALLBACK_YOGA, "yoga", "General wellness"));
  }

  return { homeRemedies, yogaExercises };
}
