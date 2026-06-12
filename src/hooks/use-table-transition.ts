/// <reference types="react/canary" />
"use client";

import { addTransitionType, useTransition } from "react";

import { FILTER_TRANSITION_TYPE } from "@/hooks/filter-transition-types";

export function useTableTransition(): [boolean, React.TransitionStartFunction] {
  const [isPending, startTransition] = useTransition();

  const startTableTransition: React.TransitionStartFunction = (callback) => {
    startTransition(() => {
      addTransitionType(FILTER_TRANSITION_TYPE);
      callback();
    });
  };

  return [isPending, startTableTransition];
}
