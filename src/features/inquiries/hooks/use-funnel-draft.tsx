"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  use,
  useState,
} from "react";

interface FunnelDraft {
  answers: Record<string, string>;
  assetDescription: string;
  files: File[];
  selectedCategoryIds: string[];
  setAnswer: (questionId: string, value: string) => void;
  setAssetDescription: Dispatch<SetStateAction<string>>;
  setFiles: Dispatch<SetStateAction<File[]>>;
  setSelectedCategoryIds: Dispatch<SetStateAction<string[]>>;
}

const FunnelDraftContext = createContext<FunnelDraft | null>(null);

export function FunnelDraftProvider({ children }: { children: ReactNode }) {
  const [assetDescription, setAssetDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  function setAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  return (
    <FunnelDraftContext.Provider
      value={{
        answers,
        assetDescription,
        files,
        selectedCategoryIds,
        setAnswer,
        setAssetDescription,
        setFiles,
        setSelectedCategoryIds,
      }}
    >
      {children}
    </FunnelDraftContext.Provider>
  );
}

export function useFunnelDraft() {
  const draft = use(FunnelDraftContext);
  if (!draft) {
    throw new Error("useFunnelDraft must be used inside FunnelDraftProvider");
  }
  return draft;
}
