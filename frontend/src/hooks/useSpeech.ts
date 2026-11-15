import { useCallback, useRef, useState } from "react";
import { api } from "../api/axios";

export default function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeech = useCallback(() => {
    utteranceRef.current = null;
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;
      stopSpeech();

      if (
        "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined"
      ) {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = "en-US";
        utteranceRef.current = utterance;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
          if (utteranceRef.current !== utterance) return;
          utteranceRef.current = null;
          setSpeaking(false);
        };
        utterance.onerror = (event) => {
          if (utteranceRef.current !== utterance) return;
          console.error("Browser speech synthesis failed:", event.error);
          utteranceRef.current = null;
          setSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      try {
        setSpeaking(true);
        const res = await api.post(
          "/tts/generate",
          { text: text.trim() },
          { responseType: "blob" }
        );
        const blob = new Blob([res.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeaking(false);
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
          }
        };
        audio.onerror = () => {
          setSpeaking(false);
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
          }
        };
        await audio.play();
      } catch (err) {
        console.error("TTS failed:", err);
        setSpeaking(false);
      }
    },
    [stopSpeech]
  );

  return { speak, stopSpeech, speaking };
}