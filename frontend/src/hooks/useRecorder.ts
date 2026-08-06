import { useCallback, useRef, useState } from "react";

export default function useRecorder(stream: MediaStream | null) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm"
      });

      setVideoBlob(blob);
    };

    recorder.start();

    recorderRef.current = recorder;

    setRecording(true);
  }, [stream]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setRecording(false);
  }, []);

  return {
    recording,
    videoBlob,
    startRecording,
    stopRecording
  };
}