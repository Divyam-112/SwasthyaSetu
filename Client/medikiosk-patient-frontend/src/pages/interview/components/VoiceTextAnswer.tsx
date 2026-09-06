import React, { useState } from "react";
import { Mic, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui";
import { cn } from "@/utils/cn";
import { speechInputService } from "@/services/speechInputService";

interface VoiceTextAnswerProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired when a quick-reply chip is tapped — treated as a complete,
   * immediately-submitted answer rather than just filling the field. */
  onQuickReply: (value: string) => void;
  quickReplies?: string[];
  /** DEMO ONLY — see speechInputService.ts. */
  simulatedVoiceAnswer?: string;
}

/**
 * The universal fallback input for open-ended questions: speak it or
 * type it. Voice results fill the field rather than auto-submitting,
 * so the patient can double-check a misheard word before continuing —
 * important for something that ends up in a clinical record.
 */
export function VoiceTextAnswer({
  value,
  onChange,
  onQuickReply,
  quickReplies,
  simulatedVoiceAnswer,
}: VoiceTextAnswerProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  function handleMicClick() {
    if (isListening) {
      speechInputService.stop();
      setIsListening(false);
      return;
    }
    setVoiceError(null);
    setIsListening(true);
    speechInputService.start({
      simulatedTranscript: simulatedVoiceAnswer,
      onResult: ({ transcript }) => {
        onChange(transcript);
        setIsListening(false);
      },
      onError: (message) => {
        setVoiceError(message);
        setIsListening(false);
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="Your answer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here…"
            disabled={isListening}
          />
        </div>
        <button
          type="button"
          onClick={handleMicClick}
          aria-pressed={isListening}
          aria-label={isListening ? "Stop listening" : "Answer by voice"}
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isListening
              ? "animate-pulse border-error bg-error/10 text-error"
              : "border-brand bg-brand/10 text-brand hover:bg-brand/20"
          )}
        >
          <Mic className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {isListening && (
        <p className="flex items-center gap-2 text-sm font-medium text-brand" role="status">
          <span className="h-2 w-2 animate-ping rounded-full bg-brand" aria-hidden="true" />
          Listening… speak your answer now
        </p>
      )}

      {voiceError && (
        <p role="alert" className="flex items-center gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {voiceError}
        </p>
      )}

      {quickReplies && quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onQuickReply(reply)}
              className="min-h-tap rounded-full border-2 border-border bg-surface px-4 text-sm font-medium text-ink-muted hover:border-brand hover:text-brand"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
