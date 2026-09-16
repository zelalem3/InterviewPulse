// frontend/src/hooks/useTranscript.ts
import { useCallback, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function useTranscript() {
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);

  const startListening = useCallback(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    // Stop previous instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    finalTranscriptRef.current = "";
    setTranscript("");
    setInterim("");

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onerror = (event: any) => {
  console.error("Speech recognition error:", event.error);

  if (event.error === "not-allowed") {
    setListening(false);
    setSupported(false);
    // optional: surface to UI
  }

  if (event.error === "aborted") {
    // ignore
  }
};

    recognition.onresult = (event: any) => {
      let interimText = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          newFinal += text + " ";
        } else {
          interimText += text;
        }
      }

      if (newFinal) {
        finalTranscriptRef.current =
          (finalTranscriptRef.current + " " + newFinal).replace(/\s+/g, " ").trim();
        setTranscript(finalTranscriptRef.current);
      }

      setInterim(interimText);
    };

   recognition.onend = () => {
  // Only auto-restart if we still intend to listen
  if (recognitionRef.current === recognition) {
    try {
      recognition.start();
    } catch (err) {
      console.warn("Recognition restart failed:", err);
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
      console.error("Failed to start recognition:", err);
      setListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (recognition) {
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    }

    setListening(false);
    setInterim("");

    // Commit any leftover interim into final
    if (interim.trim()) {
      const merged = (finalTranscriptRef.current + " " + interim)
        .replace(/\s+/g, " ")
        .trim();
      finalTranscriptRef.current = merged;
      setTranscript(merged);
    }
  }, [interim]);

  // What we show live = final + current interim
  const liveTranscript = [transcript, interim].filter(Boolean).join(" ").trim();

  return {
    transcript: liveTranscript, // use this for display + submit
    finalTranscript: transcript,
    interim,
    setTranscript: (value: string) => {
      finalTranscriptRef.current = value;
      setTranscript(value);
      setInterim("");
    },
    listening,
    supported,
    startListening,
    stopListening,
  };
}