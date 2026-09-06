/**
 * Speech-input abstraction for the AI Health Interview's microphone
 * button. No page or component ever touches SpeechRecognition (or any
 * browser speech API) directly — they only call the exported
 * `speechInputService` below. That's what lets us:
 *   1. Simulate microphone/listening behavior now, safely, with no
 *      real transcription and no "real AI" involved, per the current
 *      scope, and
 *   2. Later swap ONLY the class body in this file for a real
 *      SpeechRecognition (or server-side STT) implementation, with
 *      zero changes to InterviewPage or its child components.
 */

export interface SpeechInputResult {
  transcript: string;
}

export interface SpeechInputStartOptions {
  /**
   * DEMO ONLY — the canned transcript this mock "hears" after a short
   * simulated listening delay. A real implementation ignores this
   * entirely and returns whatever SpeechRecognition actually heard.
   */
  simulatedTranscript?: string;
  onResult: (result: SpeechInputResult) => void;
  onError: (message: string) => void;
}

export interface SpeechInputService {
  /** Whether voice input is available on this device/browser. */
  isSupported(): boolean;
  start(options: SpeechInputStartOptions): void;
  stop(): void;
}

const SIMULATED_LISTENING_MS = 1600;

class MockSpeechInputService implements SpeechInputService {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  isSupported(): boolean {
    // A real implementation would check for
    // `"SpeechRecognition" in window || "webkitSpeechRecognition" in window`.
    // The mock is always "supported" so the mic button can be exercised
    // in any browser during development and demos.
    return true;
  }

  start({ simulatedTranscript, onResult, onError }: SpeechInputStartOptions): void {
    this.stop();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      if (simulatedTranscript) {
        onResult({ transcript: simulatedTranscript });
      } else {
        onError(
          "Sorry, I couldn't hear a clear answer. Please try again or type your answer instead."
        );
      }
    }, SIMULATED_LISTENING_MS);
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const speechInputService: SpeechInputService = new MockSpeechInputService();
