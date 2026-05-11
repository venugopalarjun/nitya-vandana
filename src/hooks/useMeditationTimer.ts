"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useMeditationTimer(onComplete?: (seconds: number) => void) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const savedRef = useRef(false);

  const tick = useCallback(() => {
    setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
    savedRef.current = false;
  }, [elapsed]);

  const stop = useCallback(() => {
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
    if (elapsed > 0 && onComplete && !savedRef.current) {
      savedRef.current = true;
      onComplete(elapsed);
    }
  }, [elapsed, onComplete]);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, tick]);

  const formatTime = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  return { running, elapsed, start, stop, toggle, formatted: formatTime(elapsed) };
}
