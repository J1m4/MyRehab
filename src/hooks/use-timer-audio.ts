"use client";

import { useCallback, useEffect, useRef } from "react";

export function useTimerAudio() {
  const stopAudioRef = useRef<HTMLAudioElement | null>(null);
  const lapAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      stopAudioRef.current = new Audio("/stop.mp3");
      lapAudioRef.current = new Audio("/lap.mp3");
      
      // Preload
      stopAudioRef.current.load();
      lapAudioRef.current.load();
    }
  }, []);

  const playStop = useCallback(() => {
    if (stopAudioRef.current) {
      stopAudioRef.current.currentTime = 0;
      stopAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const playLap = useCallback(() => {
    if (lapAudioRef.current) {
      lapAudioRef.current.currentTime = 0;
      lapAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  return { playStop, playLap };
}
