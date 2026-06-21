"use client";

import { useEffect, useRef, useState } from "react";

export type RowId = "row-one" | "row-two";

const RESUME_DELAY_MS = 200;

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
  active: ActivePosition;
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
  const total = rowOneLength + rowTwoLength;
  const [autoStep, setAutoStep] = useState(0);
  const [pausedStep, setPausedStep] = useState<number | null>(null);
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
    if (pausedStep !== null) {
      return;
    }

    const id = setInterval(() => {
      setAutoStep((current) => (current + 1) % total);
    }, intervalMs);

    return () => clearInterval(id);
  }, [pausedStep, total, intervalMs]);

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
