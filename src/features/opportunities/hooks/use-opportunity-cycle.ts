"use client";

import { useEffect, useRef, useState } from "react";
import { useIsDesktop } from "@/hooks/use-media-query";

export type RowId = string;

const RESUME_DELAY_MS = 200;
const CIRCLE_PITCH_REM = 9.5;
const CIRCLE_RADIUS_REM = 4;

interface ActivePosition {
  index: number;
  row: RowId;
}

interface UseOpportunityCycleOptions {
  intervalMs?: number;
  rowOneLength: number;
  rowTwoLength: number;
}

interface UseOpportunityCycleResult {
  active: ActivePosition | null;
  isPaused: boolean;
  onCircleClick: (row: RowId, index: number) => void;
  onCircleEnter: (row: RowId, index: number) => void;
  onCircleLeave: () => void;
}

export function useOpportunityCycle({
  rowOneLength,
  rowTwoLength,
  intervalMs = 5000,
}: UseOpportunityCycleOptions): UseOpportunityCycleResult {
  const isDesktop = useIsDesktop();
  const total = rowOneLength + rowTwoLength;
  const [autoStep, setAutoStep] = useState(() =>
    getCenteredRowOneStep(rowOneLength)
  );
  const [pausedStep, setPausedStep] = useState<number | null>(null);
  const [tappedPosition, setTappedPosition] = useState<ActivePosition | null>(
    null
  );
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelPendingResume() {
    if (resumeTimeoutRef.current !== null) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }

  useEffect(
    () => () => {
      if (resumeTimeoutRef.current !== null) {
        clearTimeout(resumeTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!isDesktop || pausedStep !== null) {
      return;
    }

    const id = setInterval(() => {
      setAutoStep((current) => (current + 1) % total);
    }, intervalMs);

    return () => clearInterval(id);
  }, [isDesktop, pausedStep, total, intervalMs]);

  if (!isDesktop) {
    return {
      active: tappedPosition,
      isPaused: false,
      onCircleClick: (row, index) => {
        setTappedPosition((current) =>
          current?.row === row && current.index === index
            ? null
            : { row, index }
        );
      },
      onCircleEnter: () => {
        // no-op on mobile: there is no hover
      },
      onCircleLeave: () => {
        // no-op on mobile: tapping is the only interaction
      },
    };
  }

  const displayStep = pausedStep ?? autoStep;

  return {
    active: toPosition(displayStep, rowOneLength),
    isPaused: pausedStep !== null,
    onCircleClick: (row, index) => {
      cancelPendingResume();
      const step = toStep(row, index, rowOneLength);
      setAutoStep(step);
      setPausedStep(step);
    },
    onCircleEnter: (row, index) => {
      cancelPendingResume();
      setPausedStep(toStep(row, index, rowOneLength));
    },
    onCircleLeave: () => {
      cancelPendingResume();
      resumeTimeoutRef.current = setTimeout(() => {
        setPausedStep(null);
      }, RESUME_DELAY_MS);
    },
  };
}

function toPosition(step: number, rowOneLength: number): ActivePosition {
  if (step < rowOneLength) {
    return { row: "row-one", index: (rowOneLength - step) % rowOneLength };
  }
  return { row: "row-two", index: step - rowOneLength };
}

function toStep(row: RowId, index: number, rowOneLength: number): number {
  if (row === "row-one") {
    return (rowOneLength - index) % rowOneLength;
  }
  return rowOneLength + index;
}

function getCenteredRowOneStep(rowOneLength: number): number {
  if (rowOneLength <= 0 || typeof window === "undefined") {
    return 0;
  }

  const rootFontSize = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize
  );
  const rem = Number.isFinite(rootFontSize) ? rootFontSize : 16;
  const circlePitch = CIRCLE_PITCH_REM * rem;
  const circleRadius = CIRCLE_RADIUS_REM * rem;
  const centeredIndex = Math.round(
    (window.innerWidth / 2 - circleRadius) / circlePitch
  );
  const clampedIndex = Math.max(0, Math.min(rowOneLength - 1, centeredIndex));

  return toStep("row-one", clampedIndex, rowOneLength);
}
