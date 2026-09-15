import { useEffect, useRef, useState, useCallback } from "react";

export default function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        // First check available devices (optional but useful for debugging)
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphoneExists = devices.some((d) => d.kind === "audioinput");

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: microphoneExists,
        });

        if (!isMounted) {
          // Component unmounted while waiting for permission
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setHasAudio(mediaStream.getAudioTracks().length > 0);

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
    hasAudio,
  };
}