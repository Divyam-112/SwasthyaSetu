/**
 * Speech Service — Web Speech API (Browser-based)
 *
 * STT (Speech-to-Text) and TTS (Text-to-Speech) are now handled CLIENT-SIDE
 * using the browser's built-in Web Speech API.
 *
 * Benefits over Bhashini:
 *   ✅ No API key required
 *   ✅ Completely free
 *   ✅ Supports Hindi + 10+ Indian languages
 *   ✅ Works offline in some browsers
 *   ✅ Zero server load for speech processing
 *
 * This server-side module provides:
 *   1. Supported language configuration
 *   2. Language code mapping (BCP-47 codes for Web Speech API)
 *   3. Fallback text processing utilities
 */

// ─── Language Configuration ──────────────────────────────────────
// BCP-47 language codes used by Web Speech API
export const SUPPORTED_LANGUAGES = {
  hi: { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  en: { code: "en-IN", name: "English (India)", nativeName: "English" },
  bn: { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  ta: { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  te: { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  mr: { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  gu: { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  kn: { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  ml: { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  pa: { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  or: { code: "or-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  as: { code: "as-IN", name: "Assamese", nativeName: "অসমীয়া" },
  ur: { code: "ur-IN", name: "Urdu", nativeName: "اردو" },
  sa: { code: "sa-IN", name: "Sanskrit", nativeName: "संस्कृतम्" },
};

/**
 * Get supported languages list for the client
 * Client uses these BCP-47 codes to configure Web Speech API
 */
export function getSupportedLanguages() {
  return Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => ({
    id: key,
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName,
  }));
}

/**
 * Get BCP-47 language code for Web Speech API
 * @param {string} langCode - Short language code (e.g., 'hi', 'en', 'ta')
 * @returns {string} BCP-47 code (e.g., 'hi-IN', 'en-IN')
 */
export function getLanguageCode(langCode = "hi") {
  const lang = SUPPORTED_LANGUAGES[langCode];
  return lang ? lang.code : "hi-IN"; // Default to Hindi
}

/**
 * Validate if a language is supported
 * @param {string} langCode - Short language code
 * @returns {boolean}
 */
export function isLanguageSupported(langCode) {
  return langCode in SUPPORTED_LANGUAGES;
}

/**
 * Get speech configuration for client
 * Returns all settings the client needs to initialize Web Speech API
 */
export function getSpeechConfig(langCode = "hi") {
  const lang = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.hi;

  return {
    stt: {
      lang: lang.code,
      continuous: false, // Stop after one utterance
      interimResults: true, // Show real-time partial results
      maxAlternatives: 1,
    },
    tts: {
      lang: lang.code,
      rate: 0.9, // Slightly slower for clarity
      pitch: 1.0,
      volume: 1.0,
    },
    languageInfo: lang,
  };
}
