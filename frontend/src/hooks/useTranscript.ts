import { useCallback, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function useTranscript() {
  const recognitionRef = useRef<any>(null);
  const finalRef = useRef("");
  const shouldListenRef = useRef(false);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscriptState] = useState("");
  const [interim, setInterim] = useState("");

  const setTranscript = useCallback((value: string) => {
    finalRef.current = value;
    setTranscriptState(value);
    setInterim("");
  }, []);

  const startListening = useCallback(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      console.error("SpeechRecognition not supported");
      return;
    }

    shouldListenRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
    }

    finalRef.current = "";
    setTranscriptState("");
    setInterim("");

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        shouldListenRef.current = false;
        setListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const t = r[0].transcript;
        if (r.isFinal) finalChunk += t + " ";
        else interimText += t;
      }

      if (finalChunk) {
        finalRef.current = `${finalRef.current} ${finalChunk}`.replace(/\s+/g, " ").trim();
        setTranscriptState(finalRef.current);
      }
      setInterim(interimText);
    };

    recognition.onend = () => {
      if (shouldListenRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
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
      console.error(err);
      setListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onend = null;
      try {
        rec.stop();
      } catch {}
    }
    setListening(false);
    setInterim((prev) => {
      if (prev.trim()) {
        const merged = `${finalRef.current} ${prev}`.replace(/\s+/g, " ").trim();
        finalRef.current = merged;
        setTranscriptState(merged);
      }
      return "";
    });
  }, []);

  const liveTranscript = [transcript, interim].filter(Boolean).join(" ").trim();

  return {
    transcript: liveTranscript,
    setTranscript,
    listening,
    startListening,
    stopListening,
  };
}