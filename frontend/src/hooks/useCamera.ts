import { useEffect, useRef, useState, useCallback } from "react";

export default function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [hasAudio, setHasAudio] = useState(false);

  // Keep a stable reference to the video element
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;

    // If we already have a stream when the video element mounts, attach it
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {
        // Autoplay may be blocked; muted + playsInline should prevent this
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeCamera = async () => {
      try {
        const video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" as const,
        };
        let mediaStream: MediaStream;
        let microphoneError = "";

        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video,
            audio: true,
          });
        } catch (err) {
          if (
            !(err instanceof DOMException) ||
            ![
              "NotAllowedError",
              "NotFoundError",
              "NotReadableError",
              "OverconstrainedError",
            ].includes(err.name)
          ) {
            throw err;
          }

          microphoneError =
            err.name === "NotAllowedError"
              ? "Microphone access was denied. Allow microphone access in browser settings to answer by voice."
              : err.name === "NotFoundError"
                ? "Your browser could not find an available microphone. Check the selected input device and site permission, then reload."
                : "The microphone is unavailable. Check its browser permission and try again.";
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video,
            audio: false,
          });
        }

        if (!isMounted) {
          // Component unmounted while waiting for permission
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        const hasAudioTrack = mediaStream.getAudioTracks().length > 0;
        setHasAudio(hasAudioTrack);
        setAudioError(
          microphoneError ||
            (hasAudioTrack ? "" : "No microphone audio track is available.")
        );

        // Attach to video element if it already exists
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("Camera initialization failed:", err);

        if (err instanceof DOMException) {
          switch (err.name) {
            case "NotAllowedError":
              setError("Camera / microphone permission denied");
              break;
            case "NotFoundError":
              setError("No camera found");
              break;
            case "NotReadableError":
              setError("Camera is already in use by another application");
              break;
            case "OverconstrainedError":
              setError("Camera does not support the requested resolution");
              break;
            default:
              setError(err.message || "Unknown camera error");
          }
        } else {
          setError("Unknown camera error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef: setVideoRef,   // ← now a callback ref
    stream,
    loading,
    error,
    audioError,
    hasAudio,
  };
}