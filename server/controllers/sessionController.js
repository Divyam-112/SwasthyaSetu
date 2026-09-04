import Session from "../models/Session.js";
import Patient from "../models/Patient.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * POST /api/session/start
 * Start a new history-taking session for a patient
 */

// Multilingual first questions (no LLM call needed — instant response)
const FIRST_QUESTIONS = {
  hi: {
    allopathic:
      "Namaste! Main aapki medical history lene mein madad karunga. Sabse pehle batayein, aapko kya taklif hai?",
    ayush: "Namaste! Main aapki Ayurvedic health history lene mein madad karunga. Sabse pehle batayein, aapko kya taklif hai?",
    options: [
      "Pet mein dard",
      "Sir dard",
      "Bukhar",
      "Khansi / Sardi",
      "Jodo mein dard",
      "Chhaati mein dard",
      "Kuch aur (bolke batayein)",
    ],
  },
  en: {
    allopathic:
      "Hello! I will help you record your medical history. First, please tell me — what is your main health concern today?",
    ayush: "Hello! I will help you record your Ayurvedic health history. First, please tell me — what is your main health concern today?",
    options: [
      "Stomach pain",
      "Headache",
      "Fever",
      "Cough / Cold",
      "Joint pain",
      "Chest pain",
      "Something else",
    ],
  },
  bn: {
    allopathic:
      "নমস্কার! আমি আপনার চিকিৎসা ইতিহাস নিতে সাহায্য করব। প্রথমে বলুন, আপনার কী সমস্যা হচ্ছে?",
    ayush: "নমস্কার! আমি আপনার আয়ুর্বেদিক স্বাস্থ্য ইতিহাস নিতে সাহায্য করব। প্রথমে বলুন, আপনার কী সমস্যা হচ্ছে?",
    options: [
      "পেটে ব্যথা",
      "মাথা ব্যথা",
      "জ্বর",
      "কাশি / সর্দি",
      "গাঁটে ব্যথা",
      "বুকে ব্যথা",
      "অন্য কিছু",
    ],
  },
  ta: {
    allopathic:
      "வணக்கம்! உங்கள் மருத்துவ வரலாற்றை பதிவு செய்ய நான் உதவுவேன். முதலில் சொல்லுங்கள், உங்களுக்கு என்ன பிரச்சனை?",
    ayush: "வணக்கம்! உங்கள் ஆயுர்வேத சுகாதார வரலாற்றை பதிவு செய்ய நான் உதவுவேன். முதலில் சொல்லுங்கள், உங்களுக்கு என்ன பிரச்சனை?",
    options: [
      "வயிற்று வலி",
      "தலைவலி",
      "காய்ச்சல்",
      "இருமல் / சளி",
      "மூட்டு வலி",
      "நெஞ்சு வலி",
      "வேறு ஏதாவது",
    ],
  },
  te: {
    allopathic:
      "నమస్కారం! మీ వైద్య చరిత్రను రికార్డ్ చేయడంలో నేను సహాయం చేస్తాను. ముందుగా చెప్పండి, మీకు ఏమి సమస్య ఉంది?",
    ayush: "నమస్కారం! మీ ఆయుర్వేద ఆరోగ్య చరిత్రను రికార్డ్ చేయడంలో నేను సహాయం చేస్తాను. ముందుగా చెప్పండి, మీకు ఏమి సమస్య ఉంది?",
    options: [
      "కడుపు నొప్పి",
      "తలనొప్పి",
      "జ్వరం",
      "దగ్గు / జలుబు",
      "కీళ్ల నొప్పి",
      "ఛాతీ నొప్పి",
      "మరేదైనా",
    ],
  },
  mr: {
    allopathic:
      "नमस्कार! मी तुमचा वैद्यकीय इतिहास नोंदवण्यात मदत करेन. प्रथम सांगा, तुम्हाला काय त्रास होतोय?",
    ayush: "नमस्कार! मी तुमचा आयुर्वेदिक आरोग्य इतिहास नोंदवण्यात मदत करेन. प्रथम सांगा, तुम्हाला काय त्रास होतोय?",
    options: [
      "पोटदुखी",
      "डोकेदुखी",
      "ताप",
      "खोकला / सर्दी",
      "सांधेदुखी",
      "छातीत दुखणे",
      "काही वेगळे",
    ],
  },
  gu: {
    allopathic:
      "નમસ્તે! હું તમારો તબીબી ઇતિહાસ નોંધવામાં મદદ કરીશ. પહેલાં જણાવો, તમને શું તકલીફ છે?",
    ayush: "નમસ્તે! હું તમારો આયુર્વેદિક સ્વાસ્થ્ય ઇતિહાસ નોંધવામાં મદદ કરીશ. પહેલાં જણાવો, તમને શું તકલીફ છે?",
    options: [
      "પેટમાં દુખાવો",
      "માથાનો દુખાવો",
      "તાવ",
      "ઉધરસ / શરદી",
      "સાંધાનો દુખાવો",
      "છાતીમાં દુખાવો",
      "કંઈક બીજું",
    ],
  },
  kn: {
    allopathic:
      "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ದಾಖಲಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಮೊದಲು ಹೇಳಿ, ನಿಮಗೆ ಏನು ಸಮಸ್ಯೆ?",
    ayush: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಆಯುರ್ವೇದ ಆರೋಗ್ಯ ಇತಿಹಾಸವನ್ನು ದಾಖಲಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಮೊದಲು ಹೇಳಿ, ನಿಮಗೆ ಏನು ಸಮಸ್ಯೆ?",
    options: [
      "ಹೊಟ್ಟೆ ನೋವು",
      "ತಲೆನೋವು",
      "ಜ್ವರ",
      "ಕೆಮ್ಮು / ಶೀತ",
      "ಕೀಲು ನೋವು",
      "ಎದೆ ನೋವು",
      "ಬೇರೆ ಏನಾದರೂ",
    ],
  },
  ml: {
    allopathic:
      "നമസ്കാരം! നിങ്ങളുടെ മെഡിക്കൽ ചരിത്രം രേഖപ്പെടുത്താൻ ഞാൻ സഹായിക്കാം. ആദ്യം പറയൂ, നിങ്ങൾക്ക് എന്താണ് പ്രശ്നം?",
    ayush: "നമസ്കാരം! നിങ്ങളുടെ ആയുർവേദ ആരോഗ്യ ചരിത്രം രേഖപ്പെടുത്താൻ ഞാൻ സഹായിക്കാം. ആദ്യം പറയൂ, നിങ്ങൾക്ക് എന്താണ് പ്രശ്നം?",
    options: [
      "വയറുവേദന",
      "തലവേദന",
      "പനി",
      "ചുമ / ജലദോഷം",
      "സന്ധിവേദന",
      "നെഞ്ചുവേദന",
      "മറ്റെന്തെങ്കിലും",
    ],
  },
  pa: {
    allopathic:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਮੈਡੀਕਲ ਇਤਿਹਾਸ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ। ਪਹਿਲਾਂ ਦੱਸੋ, ਤੁਹਾਨੂੰ ਕੀ ਤਕਲੀਫ਼ ਹੈ?",
    ayush: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਆਯੁਰਵੈਦਿਕ ਸਿਹਤ ਇਤਿਹਾਸ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ। ਪਹਿਲਾਂ ਦੱਸੋ, ਤੁਹਾਨੂੰ ਕੀ ਤਕਲੀਫ਼ ਹੈ?",
    options: [
      "ਪੇਟ ਦਰਦ",
      "ਸਿਰ ਦਰਦ",
      "ਬੁਖ਼ਾਰ",
      "ਖੰਘ / ਜ਼ੁਕਾਮ",
      "ਜੋੜਾਂ ਦਾ ਦਰਦ",
      "ਛਾਤੀ ਦਾ ਦਰਦ",
      "ਕੁਝ ਹੋਰ",
    ],
  },
};

export const startSession = asyncHandler(async (req, res) => {
  const { sessionType } = req.body;
  const patientId = req.userId;

  // Get patient's preferred language
  const patient = await Patient.findById(patientId).select("preferredLanguage");
  const lang = patient?.preferredLanguage || "hi";
  const type = sessionType || "allopathic";

  // Create new session with 24h expiry for privacy auto-cleanup
  const session = await Session.create({
    patient: patientId,
    sessionType: type,
    status: "in_progress",
    completionPercentage: 0,
    currentCategory: "greeting",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // Link session to patient
  await Patient.findByIdAndUpdate(patientId, {
    $push: { sessions: session._id },
  });

  // Get first question in patient's language (fallback to Hindi)
  const langData = FIRST_QUESTIONS[lang] || FIRST_QUESTIONS.hi;
  const firstQuestion = {
    question: langData[type] || langData.allopathic,
    options: langData.options,
    category: "chief_complaint",
    completionPercentage: 0,
    isRedFlag: false,
    redFlagAlert: null,
  };

  // Save the first AI message in conversation
  session.conversation.push({
    role: "ai",
    content: firstQuestion.question,
    inputMode: "text",
    timestamp: new Date(),
    category: "greeting",
  });
  await session.save();

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { sessionId: session._id, firstQuestion },
        "Session started successfully",
      ),
    );
});

/**
 * GET /api/session/:sessionId
 * Get session details
 */
export const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId).populate(
    "patient",
    "name age gender preferredLanguage abhaId",
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session retrieved successfully"));
});

/**
 * GET /api/session/patient/all
 * Get all sessions for the logged-in patient
 */
export const getPatientSessions = asyncHandler(async (req, res) => {
  const patientId = req.userId;

  const sessions = await Session.find({ patient: patientId })
    .select(
      "sessionType status completionPercentage clinicalHistory.chiefComplaint createdAt",
    )
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, sessions, "Sessions retrieved successfully"));
});
