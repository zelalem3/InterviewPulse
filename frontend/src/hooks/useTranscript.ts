// src/hooks/useTranscript.ts
import { useState, useCallback, useRef } from "react";

// Minimal type definitions for the Web Speech API
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default function useTranscript() {
  const [transcript, setTranscriptValue] = useState("");
  const transcriptRef = useRef("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const setTranscript = useCallback((value: string) => {
    transcriptRef.current = value;
    setTranscriptValue(value);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      console.warn(
        "Speech recognition is not supported or is blocked in this browser (e.g., Brave/Firefox)."
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore cleanup errors
      }
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        console.warn(
          "Speech recognition blocked by browser security. Falling back to manual text input."
        );
      } else {
        console.warn("Speech recognition error:", event.error);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setListening(false);
    }
  }, [setTranscript]);

  const getTranscript = useCallback(() => transcriptRef.current, []);

  const stopListening = useCallback((): Promise<void> => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setListening(false);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const handleEnd = recognition.onend;
      recognition.onend = (event) => {
        handleEnd?.call(recognition, event);
        recognitionRef.current = null;
        resolve();
      };

      try {
        recognition.stop();
      } catch {
        recognitionRef.current = null;
        setListening(false);
        resolve();
      }
    });
  }, []);

  return {
    transcript,
    setTranscript,
    getTranscript,
    listening,
    startListening,
    stopListening,
  };
}