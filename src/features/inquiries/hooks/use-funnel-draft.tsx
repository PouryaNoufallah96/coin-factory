"use client";

import {
  addTransitionType,
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  startTransition,
  use,
  useEffect,
  useReducer,
} from "react";

export type FunnelView = "landing" | "onboarding" | "thank-you";

interface FunnelDraft {
  answers: Record<string, string>;
  assetDescription: string;
  email: string;
  files: File[];
  goTo: (
    view: FunnelView,
    step?: number,
    direction?: "nav-back" | "nav-forward"
  ) => void;
  selectedCategoryIds: string[];
  setAnswer: (questionId: string, value: string) => void;
  setAssetDescription: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setFiles: Dispatch<SetStateAction<File[]>>;
  setSelectedCategoryIds: Dispatch<SetStateAction<string[]>>;
  setWhatsapp: Dispatch<SetStateAction<string>>;
  step: number;
  view: FunnelView;
  whatsapp: string;
}

interface FunnelDraftState {
  answers: Record<string, string>;
  assetDescription: string;
  email: string;
  files: File[];
  selectedCategoryIds: string[];
  step: number;
  view: FunnelView;
  whatsapp: string;
}

type FunnelDraftAction =
  | { type: "setAnswer"; questionId: string; value: string }
  | { type: "setAssetDescription"; value: SetStateAction<string> }
  | { type: "setEmail"; value: SetStateAction<string> }
  | { type: "setFiles"; value: SetStateAction<File[]> }
  | { type: "setSelectedCategoryIds"; value: SetStateAction<string[]> }
  | { type: "setWhatsapp"; value: SetStateAction<string> }
  | { type: "navigate"; view: FunnelView; step: number }
  | { type: "hydrate"; state: FunnelDraftState };

const STORAGE_KEY = "cf-funnel-draft";

type PersistedState = Omit<FunnelDraftState, "files">;

const initialFunnelDraftState: FunnelDraftState = {
  answers: {},
  assetDescription: "",
  email: "",
  files: [],
  selectedCategoryIds: [],
  whatsapp: "",
  view: "landing",
  step: 1,
};

function loadPersistedState(): FunnelDraftState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialFunnelDraftState;
    }
    const parsed: Partial<PersistedState> = JSON.parse(raw);
    return {
      ...initialFunnelDraftState,
      ...parsed,
      files: [],
    };
  } catch {
    return initialFunnelDraftState;
  }
}

function persistState(state: FunnelDraftState) {
  try {
    // Thank-you means the inquiry was submitted: drop the saved draft (incl.
    // contact PII) so a returning visitor starts fresh, not on a stale flow.
    if (state.view === "thank-you") {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const { files: _files, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // storage unavailable — silently skip
  }
}

const FunnelDraftContext = createContext<FunnelDraft | null>(null);

export function FunnelDraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    funnelDraftReducer,
    initialFunnelDraftState
  );

  useEffect(() => {
    dispatch({ type: "hydrate", state: loadPersistedState() });
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => persistState(state), 150);
    return () => clearTimeout(handle);
  }, [state]);

  function setAnswer(questionId: string, value: string) {
    dispatch({ questionId, type: "setAnswer", value });
  }

  function goTo(
    view: FunnelView,
    step = 1,
    direction: "nav-back" | "nav-forward" = "nav-forward"
  ) {
    if (state.view === view) {
      dispatch({ type: "navigate", view, step });
      return;
    }

    startTransition(() => {
      addTransitionType(direction);
      dispatch({ type: "navigate", view, step });
    });
  }

  return (
    <FunnelDraftContext.Provider
      value={{
        answers: state.answers,
        assetDescription: state.assetDescription,
        email: state.email,
        files: state.files,
        selectedCategoryIds: state.selectedCategoryIds,
        whatsapp: state.whatsapp,
        view: state.view,
        step: state.step,
        goTo,
        setAnswer,
        setAssetDescription: (value) =>
          dispatch({ type: "setAssetDescription", value }),
        setEmail: (value) => dispatch({ type: "setEmail", value }),
        setFiles: (value) => dispatch({ type: "setFiles", value }),
        setSelectedCategoryIds: (value) =>
          dispatch({ type: "setSelectedCategoryIds", value }),
        setWhatsapp: (value) => dispatch({ type: "setWhatsapp", value }),
      }}
    >
      {children}
    </FunnelDraftContext.Provider>
  );
}

function funnelDraftReducer(
  state: FunnelDraftState,
  action: FunnelDraftAction
): FunnelDraftState {
  switch (action.type) {
    case "setAnswer":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case "setAssetDescription":
      return {
        ...state,
        assetDescription: resolveStateAction(
          state.assetDescription,
          action.value
        ),
      };
    case "setEmail":
      return { ...state, email: resolveStateAction(state.email, action.value) };
    case "setFiles":
      return { ...state, files: resolveStateAction(state.files, action.value) };
    case "setSelectedCategoryIds":
      return {
        ...state,
        selectedCategoryIds: resolveStateAction(
          state.selectedCategoryIds,
          action.value
        ),
      };
    case "setWhatsapp":
      return {
        ...state,
        whatsapp: resolveStateAction(state.whatsapp, action.value),
      };
    case "navigate":
      return { ...state, view: action.view, step: action.step };
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

function resolveStateAction<T>(current: T, action: SetStateAction<T>) {
  if (typeof action === "function") {
    return (action as (value: T) => T)(current);
  }

  return action;
}

export function useFunnelDraft() {
  const draft = use(FunnelDraftContext);
  if (!draft) {
    throw new Error("useFunnelDraft must be used inside FunnelDraftProvider");
  }
  return draft;
}
