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

/**
 * Drives a single page-wide "active" opportunity. It sweeps through every
 * item in row one, then every item in row two, then loops back - so only
 * one circle is ever highlighted across both rows. Hovering a circle pins it
 * (pausing the sweep and both rows' marquees) until released. Clicking a
 * circle instead jumps the sweep to that circle and keeps it running from
 * there.
 */
export function useOpportunityCycle({
  rowOneLength,
  rowTwoLength,
  intervalMs = 5000,
}: UseOpportunityCycleOptions): UseOpportunityCycleResult {
  const total = rowOneLength + rowTwoLength;
  const [autoGlobalIndex, setAutoGlobalIndex] = useState(0);
  const [pausedGlobalIndex, setPausedGlobalIndex] = useState<number | null>(
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
    if (pausedGlobalIndex !== null) {
      return;
    }

    const id = setInterval(() => {
      setAutoGlobalIndex((current) => (current + 1) % total);
    }, intervalMs);

    return () => clearInterval(id);
  }, [pausedGlobalIndex, total, intervalMs]);

  const displayGlobalIndex = pausedGlobalIndex ?? autoGlobalIndex;

  return {
    active: toPosition(displayGlobalIndex, rowOneLength),
    isPaused: pausedGlobalIndex !== null,
    onCircleClick: (row, index) => {
      cancelPendingResume();
      setPausedGlobalIndex(null);
      setAutoGlobalIndex(toGlobalIndex(row, index, rowOneLength));
    },
    onCircleEnter: (row, index) => {
      cancelPendingResume();
      setPausedGlobalIndex(toGlobalIndex(row, index, rowOneLength));
    },
    onCircleLeave: () => {
      cancelPendingResume();
      resumeTimeoutRef.current = setTimeout(() => {
        setPausedGlobalIndex(null);
      }, RESUME_DELAY_MS);
    },
  };
}

// Row one steps backward through its items (matches its rightward scroll);
// row two steps forward through its own items (matches its leftward scroll).
function toPosition(globalIndex: number, rowOneLength: number): ActivePosition {
  if (globalIndex < rowOneLength) {
    return { row: "row-one", index: rowOneLength - 1 - globalIndex };
  }
  return { row: "row-two", index: globalIndex - rowOneLength };
}

function toGlobalIndex(
  row: RowId,
  index: number,
  rowOneLength: number
): number {
  if (row === "row-one") {
    return rowOneLength - 1 - index;
  }
  return rowOneLength + index;
}
