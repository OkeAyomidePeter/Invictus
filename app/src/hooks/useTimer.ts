import { useEffect, useRef, useState, useCallback } from "react";

interface UseTimerReturn {
  remaining: number;
  isRunning: boolean;
  progress: number;
  start: (seconds: number) => void;
  skip: () => void;
  reset: () => void;
}

export function useTimer(onComplete?: () => void): UseTimerReturn {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clear();
      setTotal(seconds);
      setRemaining(seconds);
      setIsRunning(true);
      endTimeRef.current = Date.now() + seconds * 1000;
    },
    [clear],
  );

  const skip = useCallback(() => {
    clear();
    setRemaining(0);
    setTotal(0);
    setIsRunning(false);
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setRemaining(0);
    setTotal(0);
    setIsRunning(false);
  }, [clear]);

  useEffect(() => {
    if (!isRunning || total <= 0) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const newRemaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - now) / 1000),
      );

      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        clear();
        setIsRunning(false);
        onComplete?.();
      }
    }, 100); // 100ms interval for smoother responsiveness without drifting

    return clear;
  }, [isRunning, total, clear, onComplete]);

  return {
    remaining,
    isRunning,
    progress: total > 0 ? remaining / total : 0,
    start,
    skip,
    reset,
  };
}
