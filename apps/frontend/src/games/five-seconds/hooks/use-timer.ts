import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onComplete?: () => void;
}

export function useTimer({ initialTime, onComplete }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setTimeLeft(initialTime);
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newTime?: number) => {
    stop();
    setTimeLeft(newTime ?? initialTime);
  }, [initialTime, stop]);

  useEffect(() => {
    if (!isRunning)
      return undefined;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stop();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete, stop]);

  return { timeLeft, start, stop, reset, isRunning };
}
