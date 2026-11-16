import { useCallback, useRef, useState } from "react";
import { api } from "../api/axios";

export default function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const requestIdRef = useRef(0);

  const stopSpeech = useCallback(() => {
    requestIdRef.current += 1;
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
      const requestId = requestIdRef.current;
      const normalizedText = text.trim();
      const hasBrowserTts =
        "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined";
      let fallbackStarted = false;

      const speakInBrowser = () => {
        if (!hasBrowserTts || requestId !== requestIdRef.current) return;
        const utterance = new SpeechSynthesisUtterance(normalizedText);
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
          utteranceRef.current = null;
          if (event.error === "canceled" || event.error === "interrupted") {
            setSpeaking(false);
            return;
          }
          console.error("Browser speech synthesis failed:", event.error);
          setSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      };

      const fallbackToBrowser = (error: unknown) => {
        if (requestId !== requestIdRef.current || fallbackStarted) return;
        fallbackStarted = true;
        if (hasBrowserTts) {
          console.warn("Kokoro speech failed; using browser speech:", error);
          speakInBrowser();
        } else {
          console.error("Kokoro speech generation failed:", error);
          setSpeaking(false);
        }
      };

      const speakWithBackend = async () => {
        if (requestId !== requestIdRef.current) return;
        let cleanupAudio: (() => void) | undefined;
        try {
          setSpeaking(true);
          const res = await api.post(
            "/tts/generate",
            { text: normalizedText },
            { responseType: "blob" }
          );
          if (requestId !== requestIdRef.current) return;

          const blob = new Blob([res.data], { type: "audio/wav" });
          const url = URL.createObjectURL(blob);
          urlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;
          cleanupAudio = () => {
            if (audioRef.current === audio) {
              audioRef.current = null;
              setSpeaking(false);
            }
            if (urlRef.current === url) {
              URL.revokeObjectURL(url);
              urlRef.current = null;
            }
          };
          audio.onended = cleanupAudio;
          audio.onerror = () => {
            cleanupAudio?.();
            fallbackToBrowser("Backend speech audio could not be played.");
          };
          await audio.play();
        } catch (err) {
          cleanupAudio?.();
          fallbackToBrowser(err);
        }
      };

      await speakWithBackend();
    },
    [stopSpeech]
  );

  return { speak, stopSpeech, speaking };
}