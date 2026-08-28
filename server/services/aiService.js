import axios from "axios";

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────

const CLINICAL_SYSTEM_PROMPT = `You are a medical history-taking AI assistant at an Indian hospital (SwasthyaSetu).
Your job is to conduct a structured clinical history interview with the patient.

RULES:
1. Ask ONE question at a time
2. Follow the SOCRATES framework for symptoms:
   S - Site, O - Onset, C - Character, R - Radiation,
   A - Associated symptoms, T - Timing, E - Exacerbating/relieving, S - Severity
3. Be empathetic, use simple Hinglish (Hindi + English mix)
4. Provide 4-6 multiple-choice options along with each question for easy tap input
5. After chief complaint, systematically cover in order:
   HPI (using SOCRATES) → Past Medical History → Past Surgical History
   → Drug History → Allergy History → Family History → Personal History
   → Review of Systems
6. Flag RED FLAGS immediately: chest pain + breathlessness, stroke symptoms,
   severe bleeding, unconsciousness, high fever with rash, etc.
7. Track completion percentage (0-100%) based on sections covered
8. When all sections are covered, set completionPercentage to 100

OUTPUT FORMAT (strict JSON only, no markdown):
{
  "question": "Your next question to the patient in Hinglish",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "category": "chief_complaint|hpi|past_medical|past_surgical|drug_history|allergy|family_history|personal_history|review_of_systems|closing",
  "isRedFlag": false,
  "redFlagAlert": null,
  "completionPercentage": 15,
  "extractedData": {
    "field_name": "extracted value from patient's last answer"
  }
}`;

const AYUSH_EXTENSION_PROMPT = `

ADDITIONAL AYUSH/AYURVEDIC ASSESSMENT:
After completing the standard medical history, also assess:
- Prakriti (body constitution: Vata/Pitta/Kapha)
- Vikriti (current dosha imbalance)
- Agni (digestive fire: Samagni/Vishamagni/Teekshnagni/Mandagni)
- Koshtha (bowel nature: Mridu/Madhyama/Krura)
- Sara (tissue quality)
- Sattva (mental constitution: Pravara/Madhyama/Avara)
- Ahara-Vihara (diet and lifestyle)

Ask these in simple Hinglish with options. Include "ayush_assessment" as category for these questions.
When AYUSH assessment is also complete, then set completionPercentage to 100.`;

const SUMMARY_PROMPT = `You are a clinical summary generator. Generate a structured clinical history summary from the provided data.

FORMAT the summary as follows:
1. CHIEF COMPLAINT
2. HISTORY OF PRESENT ILLNESS (detailed narrative using SOCRATES findings)
3. PAST MEDICAL HISTORY
4. PAST SURGICAL HISTORY
5. DRUG HISTORY (current medications with doses)
6. ALLERGY HISTORY
7. FAMILY HISTORY
8. PERSONAL HISTORY (diet, sleep, exercise, habits)
9. REVIEW OF SYSTEMS
10. PRIOR INVESTIGATIONS (from scanned documents)
11. RED FLAGS / ALERTS

Also identify and return separately:
- redFlags: Any emergency conditions
- abnormalValues: Out-of-range lab values
- drugInteractions: Potential medication conflicts

Return as JSON:
{
  "summary": "Full formatted clinical summary text",
  "ayushSummary": "Dashavidha Pariksha summary if AYUSH session",
  "redFlags": ["flag1", "flag2"],
  "abnormalValues": [{"test": "name", "value": "val", "concern": "reason"}],
  "drugInteractions": ["interaction1"]
}`;

// ─── AI SERVICE FUNCTIONS ────────────────────────────────────────

/**
 * Call OpenRouter LLM API
 */
async function callLLM(messages, jsonMode = true) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("⚠️  OPENROUTER_API_KEY not set. Using mock response.");
    return null;
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-sonnet-4-20250514",
        messages,
        ...(jsonMode && { response_format: { type: "json_object" } }),
        temperature: 0.3,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://swasthyasetu.in",
          "X-Title": "SwasthyaSetu",
        },
        timeout: 30000,
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("LLM API Error:", error.response?.data || error.message);
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
}

/**
 * Get next question from AI based on conversation history.
 * Falls back to mock data if API key is not configured.
 */
export async function getNextQuestion(
  conversationHistory,
  sessionType = "allopathic",
) {
  const systemPrompt =
    sessionType === "ayush"
      ? CLINICAL_SYSTEM_PROMPT + AYUSH_EXTENSION_PROMPT
      : CLINICAL_SYSTEM_PROMPT;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
  ];

  const response = await callLLM(messages);

  // If no API key, return mock response
  if (!response) {
    return getMockResponse(conversationHistory);
  }

  try {
    return JSON.parse(response);
  } catch {
    console.error("Failed to parse LLM response:", response);
    return getMockResponse(conversationHistory);
  }
}

/**
 * Generate clinical summary from session data
 */
export async function generateClinicalSummary(session) {
  const messages = [
    { role: "system", content: SUMMARY_PROMPT },
    {
      role: "user",
      content: `Generate a clinical summary from this data:

PATIENT: ${session.patient?.name || "Unknown"}, Age: ${session.patient?.age || "N/A"}, Gender: ${session.patient?.gender || "N/A"}
ABHA ID: ${session.patient?.abhaId || "N/A"}

CONVERSATION HISTORY:
${JSON.stringify(session.clinicalHistory, null, 2)}

SCANNED DOCUMENTS:
${JSON.stringify(
  session.scannedDocuments?.map((d) => d.extractedData) || [],
  null,
  2,
)}

${
  session.sessionType === "ayush"
    ? `AYUSH ASSESSMENT: ${JSON.stringify(session.ayushAssessment, null, 2)}`
    : ""
}`,
    },
  ];

  const response = await callLLM(messages);

  if (!response) {
    // Mock summary
    return {
      summary: `CLINICAL HISTORY SUMMARY
Patient: ${session.patient?.name || "Unknown"}

Chief Complaint: ${session.clinicalHistory?.chiefComplaint || "Not recorded"}

[Summary will be generated when OpenRouter API key is configured]

Note: This is a mock summary. Configure OPENROUTER_API_KEY in .env for AI-generated summaries.`,
      redFlags: session.clinicalSummary?.redFlags || [],
      abnormalValues: [],
      drugInteractions: [],
    };
  }

  try {
    return JSON.parse(response);
  } catch {
    return {
      summary: response,
      redFlags: [],
      abnormalValues: [],
      drugInteractions: [],
    };
  }
}

/**
 * Extract and merge clinical data from AI response into session
 */
export async function extractClinicalData(session, extractedData) {
  if (!extractedData) return;

  const history = session.clinicalHistory || {};

  // Merge extracted data based on field names
  for (const [key, value] of Object.entries(extractedData)) {
    switch (key) {
      case "chiefComplaint":
        history.chiefComplaint = value;
        break;
      case "site":
      case "onset":
      case "character":
      case "radiation":
      case "timing":
      case "severity":
        if (!history.hpiDetails) history.hpiDetails = {};
        history.hpiDetails[key] = value;
        break;
      case "associatedSymptoms":
      case "exacerbatingFactors":
      case "relievingFactors":
        if (!history.hpiDetails) history.hpiDetails = {};
        if (!history.hpiDetails[key]) history.hpiDetails[key] = [];
        if (Array.isArray(value)) {
          history.hpiDetails[key].push(...value);
        } else {
          history.hpiDetails[key].push(value);
        }
        break;
      default:
        // Store any other extracted data in appropriate fields
        break;
    }
  }

  session.clinicalHistory = history;
}

// ─── MOCK RESPONSES (for development without API key) ────────────

const MOCK_QUESTIONS = [
  {
    question: "Dard kahan ho raha hai?",
    options: [
      "Pet mein",
      "Chhati mein",
      "Sir mein",
      "Peeth mein",
      "Haath/Pair mein",
    ],
    category: "hpi",
    completionPercentage: 10,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Yeh taklif kab se hai?",
    options: [
      "Aaj se",
      "2-3 din se",
      "1 hafte se",
      "1 mahine se",
      "Bahut purani hai",
    ],
    category: "hpi",
    completionPercentage: 20,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Dard kaisa hai?",
    options: [
      "Tez / Chubhne wala",
      "Halka / Dull",
      "Jalan wala",
      "Marod / Cramping",
      "Kabhi-kabhi aata hai",
    ],
    category: "hpi",
    completionPercentage: 30,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Kya aapko koi purani bimari hai?",
    options: [
      "Diabetes (Sugar)",
      "BP (High/Low)",
      "Thyroid",
      "Heart problem",
      "Koi nahi",
      "Haan, kuch aur",
    ],
    category: "past_medical",
    completionPercentage: 45,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Kya aapki kabhi koi surgery hui hai?",
    options: ["Haan", "Nahi"],
    category: "past_surgical",
    completionPercentage: 55,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Kya aap koi dawai le rahe hain abhi?",
    options: [
      "Haan, regular leta/leti hoon",
      "Kabhi-kabhi",
      "Nahi, koi dawai nahi",
    ],
    category: "drug_history",
    completionPercentage: 65,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Kya aapko kisi dawai ya khaane se allergy hai?",
    options: ["Haan", "Nahi", "Pata nahi"],
    category: "allergy",
    completionPercentage: 72,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question:
      "Aapke ghar mein kisi ko koi purani bimari hai? (Maa, Papa, Bhai, Behen)",
    options: ["Diabetes", "BP", "Heart problem", "Cancer", "Kisi ko kuch nahi"],
    category: "family_history",
    completionPercentage: 80,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question: "Aapka khana-peena kaisa hai?",
    options: [
      "Vegetarian",
      "Non-Vegetarian",
      "Vegan",
      "Irregular khana khata/khati hoon",
    ],
    category: "personal_history",
    completionPercentage: 90,
    isRedFlag: false,
    extractedData: {},
  },
  {
    question:
      "Dhanyavaad! Aapki medical history complete ho gayi hai. Kya aap kuch aur batana chahte hain?",
    options: ["Nahi, sab bata diya", "Haan, kuch aur hai"],
    category: "closing",
    completionPercentage: 100,
    isRedFlag: false,
    extractedData: {},
  },
];

function getMockResponse(conversationHistory) {
  // Count patient messages to determine which mock question to return
  const patientMessages = conversationHistory.filter(
    (m) => m.role === "user",
  ).length;
  const index = Math.min(patientMessages, MOCK_QUESTIONS.length - 1);
  return MOCK_QUESTIONS[index];
}
