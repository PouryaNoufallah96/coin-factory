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

    let animationId: number;
    let lastFired = 0;

    const frame = (timestamp: number) => {
      if (timestamp - lastFired >= 1800) {
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
        lastFired = timestamp;
      }
      animationId = requestAnimationFrame(frame);
    };

    animationId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return null;
}
