// frontend/src/hooks/useSpeech.ts
import { useCallback, useRef, useState } from "react";
import { api } from "../api/axios";

export default function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;

      // Stop any current audio
      stopSpeech();

      try {
        setSpeaking(true);

        const res = await api.post(
          "/tts/generate",
          { text: text.trim() },
          { responseType: "blob" }
        );

        const blob = new Blob([res.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setSpeaking(false);
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
          audioRef.current = null;
        };

        audio.onerror = () => {
          console.error("Audio playback error");
          setSpeaking(false);
        };

        await audio.play();
      } catch (err) {
        console.error("TTS failed:", err);
        setSpeaking(false);

        // Last-resort browser TTS fallback
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text.trim());
          u.lang = "en-US";
          u.onstart = () => setSpeaking(true);
          u.onend = () => setSpeaking(false);
          u.onerror = () => setSpeaking(false);
          window.speechSynthesis.speak(u);
        }
      }
    },
    [stopSpeech]
  );

  return {
    speak,
    stopSpeech,
    speaking,
  };
}