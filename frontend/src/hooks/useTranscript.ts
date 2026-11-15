import { useState, useCallback, useRef } from "react";

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
  const shouldListenRef = useRef(false);

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

    // Mark that we intentionally want to keep listening
    shouldListenRef.current = true;

    // Clean up any previous instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // prevent unwanted restart
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
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.warn(
          "Speech recognition blocked by browser security. Falling back to manual text input."
        );
        shouldListenRef.current = false;
        setListening(false);
        return;
      }

      // "no-speech", "aborted", "network", etc. — we usually want to keep going
      console.warn("Speech recognition error:", event.error);
      // Don't set listening = false here; onend will handle restart logic
    };

    recognition.onend = () => {
      // Only restart if the user is still supposed to be answering
      if (shouldListenRef.current && recognitionRef.current === recognition) {
        try {
          // Small delay helps avoid "already started" race conditions in some browsers
          setTimeout(() => {
            if (shouldListenRef.current && recognitionRef.current === recognition) {
              recognition.start();
            }
          }, 150);
        } catch (err) {
          console.warn("Failed to restart speech recognition:", err);
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setListening(false);
      shouldListenRef.current = false;
    }
  }, [setTranscript]);

  const getTranscript = useCallback(() => transcriptRef.current, []);

  const stopListening = useCallback((): Promise<void> => {
    // Tell onend not to restart
    shouldListenRef.current = false;

    const recognition = recognitionRef.current;
    if (!recognition) {
      setListening(false);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const handleEnd = recognition.onend;

      recognition.onend = (event) => {
        // Call original handler if it existed
        handleEnd?.call(recognition, event);
        recognitionRef.current = null;
        setListening(false);
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
