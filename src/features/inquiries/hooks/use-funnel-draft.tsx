"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  use,
  useReducer,
} from "react";

interface FunnelDraft {
  answers: Record<string, string>;
  assetDescription: string;
  email: string;
  files: File[];
  selectedCategoryIds: string[];
  setAnswer: (questionId: string, value: string) => void;
  setAssetDescription: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setFiles: Dispatch<SetStateAction<File[]>>;
  setSelectedCategoryIds: Dispatch<SetStateAction<string[]>>;
  setWhatsapp: Dispatch<SetStateAction<string>>;
  whatsapp: string;
}

interface FunnelDraftState {
  answers: Record<string, string>;
  assetDescription: string;
  email: string;
  files: File[];
  selectedCategoryIds: string[];
  whatsapp: string;
}

type FunnelDraftAction =
  | { type: "setAnswer"; questionId: string; value: string }
  | { type: "setAssetDescription"; value: SetStateAction<string> }
  | { type: "setEmail"; value: SetStateAction<string> }
  | { type: "setFiles"; value: SetStateAction<File[]> }
  | { type: "setSelectedCategoryIds"; value: SetStateAction<string[]> }
  | { type: "setWhatsapp"; value: SetStateAction<string> };

const initialFunnelDraftState: FunnelDraftState = {
  answers: {},
  assetDescription: "",
  email: "",
  files: [],
  selectedCategoryIds: [],
  whatsapp: "",
};

const FunnelDraftContext = createContext<FunnelDraft | null>(null);

export function FunnelDraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    funnelDraftReducer,
    initialFunnelDraftState
  );

  function setAnswer(questionId: string, value: string) {
    dispatch({ questionId, type: "setAnswer", value });
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
