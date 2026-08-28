// ─── Language Codes (BCP-47 for Web Speech API) ─────────────────
const LANGUAGE_MAP = {
  hi: "hi-IN", // Hindi
  en: "en-IN", // English (India)
  bn: "bn-IN", // Bengali
  ta: "ta-IN", // Tamil
  te: "te-IN", // Telugu
  mr: "mr-IN", // Marathi
  gu: "gu-IN", // Gujarati
  kn: "kn-IN", // Kannada
  ml: "ml-IN", // Malayalam
  pa: "pa-IN", // Punjabi
  or: "or-IN", // Odia
  as: "as-IN", // Assamese
  ur: "ur-IN", // Urdu
  sa: "sa-IN", // Sanskrit
};

// ─── Check Browser Support ──────────────────────────────────────
function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function isSpeechSynthesisSupported() {
  return !!window.speechSynthesis;
}

// ─── Speech-to-Text (STT) Class ─────────────────────────────────
class SpeechToText {
  constructor(language = "hi") {
    if (!isSpeechRecognitionSupported()) {
      throw new Error(
        "Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
      );
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new SpeechRecognition();
    this.language = language;
    this.isListening = false;

    // Configure
    this.recognition.lang = LANGUAGE_MAP[language] || "hi-IN";
    this.recognition.continuous = false; // Stop after one utterance
    this.recognition.interimResults = true; // Show real-time partial results
    this.recognition.maxAlternatives = 1;

    // Callbacks (user can override)
    this.onInterimResult = null; // (partialText) => {}
    this.onListeningStart = null; // () => {}
    this.onListeningEnd = null; // () => {}
    this.onError = null; // (error) => {}
  }

  /**
   * Set language for recognition
   */
  setLanguage(langCode) {
    this.language = langCode;
    this.recognition.lang = LANGUAGE_MAP[langCode] || "hi-IN";
  }

  /**
   * Start listening and return a Promise that resolves with the final transcript
   * @returns {Promise<string>} - The transcribed text
   */
  listen() {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error("Already listening. Please wait."));
        return;
      }

      this.isListening = true;
      let finalTranscript = "";

      // Notify listener started
      if (this.onListeningStart) this.onListeningStart();

      this.recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Send interim results for real-time display
        if (this.onInterimResult && interimTranscript) {
          this.onInterimResult(interimTranscript);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onListeningEnd) this.onListeningEnd();

        if (finalTranscript.trim()) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error("Kuch sun nahi paaya. Please dobara try karein."));
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.onListeningEnd) this.onListeningEnd();

        const errorMessages = {
          "no-speech": "Koi awaaz nahi aayi. Please mic ke paas bolein.",
          "audio-capture": "Microphone nahi mila. Please mic permission dein.",
          "not-allowed":
            "Microphone permission denied. Browser settings mein allow karein.",
          network: "Network error. Please internet connection check karein.",
          aborted: "Speech recognition band kar diya gaya.",
        };

        const message =
          errorMessages[event.error] ||
          `Speech recognition error: ${event.error}`;

        if (this.onError) this.onError(message);
        reject(new Error(message));
      };

      // Start listening
      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(new Error("Mic start nahi ho paya. Page reload karein."));
      }
    });
  }

  /**
   * Stop listening manually
   */
  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Abort listening (discard results)
   */
  abort() {
    if (this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }
}

// ─── Text-to-Speech (TTS) Class ─────────────────────────────────
class TextToSpeech {
  constructor(language = "hi") {
    if (!isSpeechSynthesisSupported()) {
      throw new Error(
        "Speech Synthesis is not supported in this browser. Please use Chrome, Edge, or Safari.",
      );
    }

    this.synth = window.speechSynthesis;
    this.language = language;
    this.rate = 0.9; // Slightly slower for clarity (medical context)
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isSpeaking = false;

    // Callbacks
    this.onSpeakStart = null; // () => {}
    this.onSpeakEnd = null; // () => {}
    this.onError = null; // (error) => {}

    // Pre-load voices
    this._loadVoices();
  }

  /**
   * Load available voices (async on some browsers)
   */
  _loadVoices() {
    this.voices = this.synth.getVoices();

    // Chrome loads voices async
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  /**
   * Get the best voice for the given language
   */
  _getBestVoice(langCode) {
    const bcp47 = LANGUAGE_MAP[langCode] || "hi-IN";
    const voices = this.synth.getVoices();

    // Try exact match first
    let voice = voices.find((v) => v.lang === bcp47);

    // Try partial match (e.g., "hi" matches "hi-IN")
    if (!voice) {
      voice = voices.find((v) => v.lang.startsWith(langCode));
    }

    // Fallback to any Indian English voice
    if (!voice) {
      voice = voices.find((v) => v.lang === "en-IN");
    }

    return voice || null;
  }

  /**
   * Set language for TTS
   */
  setLanguage(langCode) {
    this.language = langCode;
  }

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {object} options - Optional overrides { rate, pitch, volume, lang }
   * @returns {Promise<void>}
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!text || text.trim() === "") {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language and voice
      const langCode = options.lang || this.language;
      utterance.lang = LANGUAGE_MAP[langCode] || "hi-IN";

      const voice = this._getBestVoice(langCode);
      if (voice) {
        utterance.voice = voice;
      }

      // Set properties
      utterance.rate = options.rate || this.rate;
      utterance.pitch = options.pitch || this.pitch;
      utterance.volume = options.volume || this.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onSpeakStart) this.onSpeakStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.onSpeakEnd) this.onSpeakEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        if (this.onError) this.onError(event.error);
        reject(new Error(`TTS Error: ${event.error}`));
      };

      this.synth.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Pause speaking
   */
  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume speaking
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Get list of available voices for Indian languages
   */
  getIndianVoices() {
    const indianLangs = Object.values(LANGUAGE_MAP);
    return this.synth
      .getVoices()
      .filter((v) =>
        indianLangs.some((lang) => v.lang.startsWith(lang.split("-")[0])),
      );
  }
}

// ─── Combined Speech Manager ────────────────────────────────────
class SpeechManager {
  /**
   * @param {string} language - Language code (e.g., 'hi', 'en', 'ta')
   */
  constructor(language = "hi") {
    this.language = language;
    this.stt = null;
    this.tts = null;
    this.isSupported = {
      stt: isSpeechRecognitionSupported(),
      tts: isSpeechSynthesisSupported(),
    };

    // Initialize available services
    if (this.isSupported.stt) {
      this.stt = new SpeechToText(language);
    }
    if (this.isSupported.tts) {
      this.tts = new TextToSpeech(language);
    }
  }

  /**
   * Set language for both STT and TTS
   */
  setLanguage(langCode) {
    this.language = langCode;
    if (this.stt) this.stt.setLanguage(langCode);
    if (this.tts) this.tts.setLanguage(langCode);
  }

  /**
   * Listen for speech and return transcribed text
   * @returns {Promise<string>}
   */
  async listen() {
    if (!this.stt) {
      throw new Error("Speech Recognition not supported in this browser.");
    }
    return this.stt.listen();
  }

  /**
   * Speak the given text
   * @param {string} text
   * @returns {Promise<void>}
   */
  async speak(text) {
    if (!this.tts) {
      console.warn("TTS not supported — skipping speech output.");
      return;
    }
    return this.tts.speak(text);
  }

  /**
   * Stop all speech activity
   */
  stopAll() {
    if (this.stt) this.stt.stop();
    if (this.tts) this.tts.stop();
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return Object.entries(LANGUAGE_MAP).map(([code, bcp47]) => ({
      code,
      bcp47,
    }));
  }

  /**
   * Check browser compatibility
   */
  static checkBrowserSupport() {
    return {
      speechRecognition: isSpeechRecognitionSupported(),
      speechSynthesis: isSpeechSynthesisSupported(),
      recommended:
        isSpeechRecognitionSupported() && isSpeechSynthesisSupported(),
      browser: navigator.userAgent,
    };
  }
}

// ─── Exports ────────────────────────────────────────────────────
// Use ES module export if available, otherwise attach to window
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SpeechManager,
    SpeechToText,
    TextToSpeech,
    LANGUAGE_MAP,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
  };
} else {
  // For direct browser usage (script tag)
  window.SwasthyaSetuSpeech = {
    SpeechManager,
    SpeechToText,
    TextToSpeech,
    LANGUAGE_MAP,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
  };
}
