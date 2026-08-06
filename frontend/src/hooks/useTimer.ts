import { useEffect, useState } from "react";

export default function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const start = () => setRunning(true);

  const stop = () => setRunning(false);

  const reset = (value: number) => {
    setSeconds(value);
    setRunning(false);
  };

  return {
    seconds,
    running,
    start,
    stop,
    reset
  };
}