import axios from "axios";

// ─── LANGUAGE CONFIGURATION ──────────────────────────────────────

const LANGUAGE_MAP = {
  hi: { name: "Hindi", script: "Devanagari", example: "Aapko kya taklif hai?" },
  en: {
    name: "English",
    script: "Latin",
    example: "What seems to be the problem?",
  },
  bn: { name: "Bengali", script: "Bengali", example: "আপনার কী সমস্যা হচ্ছে?" },
  ta: { name: "Tamil", script: "Tamil", example: "உங்களுக்கு என்ன பிரச்சனை?" },
  te: { name: "Telugu", script: "Telugu", example: "మీకు ఏమి సమస్య ఉంది?" },
  mr: {
    name: "Marathi",
    script: "Devanagari",
    example: "तुम्हाला काय त्रास होतोय?",
  },
  gu: { name: "Gujarati", script: "Gujarati", example: "તમને શું તકલીફ છે?" },
  kn: { name: "Kannada", script: "Kannada", example: "ನಿಮಗೆ ಏನು ಸಮಸ್ಯೆ?" },
  ml: {
    name: "Malayalam",
    script: "Malayalam",
    example: "നിങ്ങൾക്ക് എന്താണ് പ്രശ്നം?",
  },
  pa: { name: "Punjabi", script: "Gurmukhi", example: "ਤੁਹਾਨੂੰ ਕੀ ਤਕਲੀਫ਼ ਹੈ?" },
};

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────

function getClinicalSystemPrompt(langCode = "hi") {
  const lang = LANGUAGE_MAP[langCode] || LANGUAGE_MAP.hi;

  return `You are a medical history-taking AI assistant at an Indian hospital.
Your job is to conduct a structured clinical history interview with the patient.

LANGUAGE INSTRUCTION:
- You MUST ask all questions and provide all options in ${lang.name} language.
- Use simple, conversational ${lang.name} that a common person can understand easily.
- For medical terms, you may include the English term in parentheses for clarity.
  Example: "ब्लड प्रेशर (Blood Pressure)" or "${lang.example}"
- Keep the language natural and empathetic.

RULES:
1. Ask ONE question at a time
2. Follow the SOCRATES framework for symptoms:
   S - Site, O - Onset, C - Character, R - Radiation,
   A - Associated symptoms, T - Timing, E - Exacerbating/relieving, S - Severity
3. Be empathetic, use simple ${lang.name}
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
  "question": "Your next question to the patient in ${lang.name}",
  "options": ["Option 1 in ${lang.name}", "Option 2 in ${lang.name}", "Option 3", "Option 4"],
  "category": "chief_complaint|hpi|past_medical|past_surgical|drug_history|allergy|family_history|personal_history|review_of_systems|closing",
  "isRedFlag": false,
  "redFlagAlert": null,
  "completionPercentage": 15,
  "extractedData": {
    "field_name": "extracted value from patient's last answer"
  }
}`;
}

function getAyushExtensionPrompt(langCode = "hi") {
  const lang = LANGUAGE_MAP[langCode] || LANGUAGE_MAP.hi;

  return `

ADDITIONAL AYUSH/AYURVEDIC ASSESSMENT:
After completing the standard medical history, also assess:
- Prakriti (body constitution: Vata/Pitta/Kapha)
- Vikriti (current dosha imbalance)
- Agni (digestive fire: Samagni/Vishamagni/Teekshnagni/Mandagni)
- Koshtha (bowel nature: Mridu/Madhyama/Krura)
- Sara (tissue quality)
- Sattva (mental constitution: Pravara/Madhyama/Avara)
- Ahara-Vihara (diet and lifestyle)

Ask these in simple ${lang.name} with options. Include "ayush_assessment" as category for these questions.
When AYUSH assessment is also complete, then set completionPercentage to 100.`;
}

function getSummaryPrompt(langCode = "hi") {
  const lang = LANGUAGE_MAP[langCode] || LANGUAGE_MAP.hi;

  return `You are a clinical summary generator. Generate a structured clinical history summary from the provided data.

You MUST generate TWO summaries:
1. "summary" — A formal, physician-facing clinical summary in ENGLISH (standard medical format)
2. "patientSummary" — A simple, easy-to-understand summary in ${lang.name} language for the patient

FORMAT for "summary" (English, doctor-facing):
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

FORMAT for "patientSummary" (${lang.name}, patient-facing):
- Write in simple, conversational ${lang.name}
- Summarize what the patient told (chief complaint, key history points)
- List any medications they mentioned
- Mention any red flags in simple words the patient can understand
- Keep it short (5-8 lines max)

Also identify and return separately:
- redFlags: Any emergency conditions
- abnormalValues: Out-of-range lab values
- drugInteractions: Potential medication conflicts

Return as JSON:
{
  "summary": "Full formatted clinical summary in English",
  "patientSummary": "Simple summary in ${lang.name} for the patient",
  "ayushSummary": "Dashavidha Pariksha summary if AYUSH session",
  "redFlags": ["flag1", "flag2"],
  "abnormalValues": [{"test": "name", "value": "val", "concern": "reason"}],
  "drugInteractions": ["interaction1"]
}`;
}

// ─── AI SERVICE FUNCTIONS ────────────────────────────────────────

/**
 * Call OpenRouter LLM API
 */
async function callLLM(messages, jsonMode = true) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set. Using mock response.");
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
 * @param {Array} conversationHistory - Chat messages
 * @param {string} sessionType - "allopathic" or "ayush"
 * @param {string} language - Patient's preferred language code (e.g., "hi", "ta", "bn")
 */
export async function getNextQuestion(
  conversationHistory,
  sessionType = "allopathic",
  language = "hi",
) {
  const systemPrompt =
    sessionType === "ayush"
      ? getClinicalSystemPrompt(language) + getAyushExtensionPrompt(language)
      : getClinicalSystemPrompt(language);

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
 * @param {Object} session - Populated session document
 * @param {string} language - Patient's preferred language code
 */
export async function generateClinicalSummary(session, language = "hi") {
  const messages = [
    { role: "system", content: getSummaryPrompt(language) },
    {
      role: "user",
      content: `Generate a clinical summary from this data:

PATIENT: ${session.patient?.name || "Unknown"}, Age: ${session.patient?.age || "N/A"}, Gender: ${session.patient?.gender || "N/A"}
ABHA ID: ${session.patient?.abhaId || "N/A"}
PATIENT LANGUAGE: ${language}

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
      patientSummary: "[Patient summary will be generated in their language when API key is configured]",
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
      patientSummary: "",
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

// ─── PATIENT CHAT SYSTEM PROMPT ──────────────────────────────────

function getPatientChatSystemPrompt(langCode = "hi", contextSummary = "") {
  const lang = LANGUAGE_MAP[langCode] || LANGUAGE_MAP.hi;

  return `You are "SwasthyaSetu Health Companion" — a friendly, knowledgeable AI health assistant for Indian patients.

LANGUAGE INSTRUCTION:
- Respond ONLY in ${lang.name} language using simple, conversational words.
- Use the ${lang.script} script.
- For medical terms, include English in parentheses for clarity.

YOUR ROLE:
You are a health EDUCATOR and WELLNESS GUIDE, NOT a doctor. You help patients understand their health better.

WHAT YOU CAN DO:
1. ✅ Explain medical conditions in simple ${lang.name}
2. ✅ Clarify common health doubts and misconceptions
3. ✅ Provide Ayurvedic wellness knowledge:
   - Prakriti (Vata/Pitta/Kapha) based diet and lifestyle tips
   - Dosha balancing through food and daily routine
   - Common Ayurvedic herbs and their general benefits (Ashwagandha, Tulsi, Haldi, Amla, etc.)
   - Panchakarma awareness
   - Dinacharya (daily routine) and Ritucharya (seasonal routine)
4. ✅ Suggest basic exercises:
   - Yoga asanas suitable for common conditions
   - Pranayama (breathing exercises) — Anulom Vilom, Kapalbhati, Bhramari
   - Walking and stretching routines
   - Exercises for specific conditions (back pain, diabetes management, stress)
5. ✅ Provide general wellness tips (hydration, sleep hygiene, stress management)
6. ✅ Explain what lab reports mean in simple language

STRICT SAFETY RULES — YOU MUST NEVER:
1. ❌ NEVER prescribe any medicine (allopathic, ayurvedic, or homeopathic)
2. ❌ NEVER suggest changing doses of existing medications
3. ❌ NEVER diagnose any condition
4. ❌ NEVER contradict the doctor's prescription or advice
5. ❌ NEVER provide treatment plans
6. ❌ NEVER claim to replace a doctor's consultation

If asked to prescribe or diagnose, ALWAYS respond with:
"Main aapko dawai ya diagnosis nahi de sakta. Iske liye apne doctor se zaroor milein."

PATIENT'S HEALTH CONTEXT:
${contextSummary || "No clinical summary available for this patient yet."}

RESPONSE STYLE:
- Be warm, empathetic, and encouraging
- Use simple language, avoid complex medical jargon
- Keep responses concise (3-6 sentences for simple questions, more for detailed explanations)
- Use bullet points for lists
- Always end with encouragement or a wellness tip when appropriate
- If you're unsure, recommend consulting their doctor`;
}

/**
 * Get AI response for patient chat
 * @param {Array} conversationHistory - Chat messages
 * @param {string} contextSummary - Patient's clinical summary for context
 * @param {string} language - Patient's preferred language code
 * @param {boolean} isFirstMessage - Whether this is the first message (welcome)
 */
export async function getPatientChatResponse(
  conversationHistory,
  contextSummary = "",
  language = "hi",
  isFirstMessage = false,
) {
  const systemPrompt = getPatientChatSystemPrompt(language, contextSummary);
  const lang = LANGUAGE_MAP[language] || LANGUAGE_MAP.hi;

  const messages = [{ role: "system", content: systemPrompt }];

  if (isFirstMessage) {
    messages.push({
      role: "user",
      content: `Greet the patient warmly in ${lang.name}. Introduce yourself as SwasthyaSetu Health Companion. Briefly mention what you can help with (health doubts, ayurvedic tips, exercises). ${contextSummary ? "You have their health summary — let them know you're aware of their recent visit and ready to help with any questions." : "Let them know they can ask any health-related questions."} Keep it short and friendly (3-4 lines max).`,
    });
  } else {
    messages.push(...conversationHistory);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    // Mock response for development
    if (isFirstMessage) {
      const mockGreetings = {
        hi: "Namaste! Main SwasthyaSetu Health Companion hoon. Main aapki health se judi baatein samjhane, Ayurvedic tips dene, aur exercises suggest karne mein madad kar sakta hoon. Puchiye, aapko kya jaanna hai?",
        en: "Hello! I'm SwasthyaSetu Health Companion. I can help you understand your health better, share Ayurvedic wellness tips, and suggest exercises. What would you like to know?",
      };
      return mockGreetings[language] || mockGreetings.hi;
    }
    return language === "en"
      ? "Thank you for your question! For the best guidance, please configure the AI service. In the meantime, I recommend staying hydrated, getting 7-8 hours of sleep, and doing light exercises like walking."
      : "Aapka sawaal dhanyavaad! AI service configure hone par main aapko behtar madad de paunga. Tab tak, khub paani piyein, 7-8 ghante ki neend lein, aur halki exercise jaise morning walk zaroor karein.";
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-sonnet-4-20250514",
        messages,
        temperature: 0.5,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://swasthyasetu.in",
          "X-Title": "SwasthyaSetu Health Companion",
        },
        timeout: 30000,
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Patient Chat AI Error:",
      error.response?.data || error.message,
    );
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
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
