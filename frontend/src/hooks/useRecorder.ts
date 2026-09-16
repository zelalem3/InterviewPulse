import { useCallback, useRef, useState } from "react";

export default function useRecorder(stream: MediaStream | null) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const startRecording = useCallback(() => {
    if (!stream) {
      console.error("No media stream — allow camera/mic first");
      return false;
    }

    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        setVideoBlob(
          new Blob(chunksRef.current, { type: "video/webm" })
        );
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      return true;
    } catch (err) {
      console.error("MediaRecorder failed:", err);
      setRecording(false);
      return false;
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    try {
      recorderRef.current?.stop();
    } catch {}
    recorderRef.current = null;
    setRecording(false);
  }, []);

  return { recording, videoBlob, startRecording, stopRecording };
}