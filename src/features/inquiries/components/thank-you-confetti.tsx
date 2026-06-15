"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

export function ThankYouConfetti() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const defaults = {
      disableForReducedMotion: true,
      origin: { x: 0.5, y: 0.16 },
      scalar: 0.82,
      spread: 68,
      ticks: 160,
    };

    const fire = () => {
      confetti({
        ...defaults,
        angle: 80,
        particleCount: 36,
        startVelocity: 24,
      });
      confetti({
        ...defaults,
        angle: 100,
        particleCount: 36,
        startVelocity: 24,
      });
    };

    fire();
    const intervalId = setInterval(fire, 1800);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
