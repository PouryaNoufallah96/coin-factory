"use client";

import { CircleX, FileText, Plus } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import {
  addTransitionType,
  type ChangeEvent,
  type ReactNode,
  startTransition,
  useRef,
} from "react";
import { funnelAlert } from "@/components/common/funnel-alert";
import { InputSurface } from "@/components/common/input-surface";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { PublicCategory } from "@/features/categories/schemas/category";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_EXTENSION_BY_MIME,
  DOCUMENT_PICKER_ACCEPT,
  MAX_CATEGORIES_PER_INQUIRY,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES,
} from "@/features/inquiries/schemas/file-constraints";
import {
  hasIntakeSignal,
  INTAKE_SIGNAL_MESSAGE,
} from "@/features/inquiries/schemas/intake-signal";
import { cn } from "@/lib/utils";
import { useFunnelDraft } from "../hooks/use-funnel-draft";

const HERO_SUBLINE = "What do you want to";
const HERO_WORD = "Tokenize?";
const SEARCH_PLACEHOLDER =
  "e.g Oil Refinery in Indonesia, Hotel in Dubai, Gold Mine...";

const DOCUMENT_LABEL_BY_EXTENSION: Record<string, string> = {
  ".doc": "Word",
  ".docx": "Word",
  ".pdf": "PDF",
};

export function LandingPage({ children }: { children: ReactNode }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    assetDescription,
    files,
    selectedCategoryIds,
    setAssetDescription,
    setFiles,
  } = useFunnelDraft();

  const searchActive = assetDescription.trim().length > 0 || files.length > 0;

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const pickedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (pickedFiles.length === 0) {
      return;
    }

    const nextFiles = [...files];
    for (const file of pickedFiles) {
      if (nextFiles.length >= MAX_FILES) {
        funnelAlert(`Attach up to ${MAX_FILES} documents.`);
        return;
      }
      if (!isAllowedDocument(file)) {
        funnelAlert(`${file.name} is not a PDF or Word document.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        funnelAlert(`${file.name} is larger than 5 MB.`);
        return;
      }
      nextFiles.push(file);
    }

    setFiles(nextFiles);
  }

  function removeFile(index: number) {
    setFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function continueToWizard(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !hasIntakeSignal({
        assetDescription,
        categoryIds: selectedCategoryIds,
        files,
      })
    ) {
      funnelAlert(INTAKE_SIGNAL_MESSAGE);
      return;
    }
    startTransition(() => {
      addTransitionType("nav-forward");
      router.push("/onboarding/1" as Route);
    });
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-start px-(--cf-page-x) pt-(--cf-landing-content-top) pb-6">
      <div className="flex w-full flex-col items-center gap-20 sm:14">
        <div className="cf-content-container flex flex-col items-center gap-(--cf-hero-stack-gap) text-center animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both]">
          <p className="text-(length:--cf-text-hero-sub) font-light text-cf-text-primary leading-none">
            {HERO_SUBLINE}
          </p>
          <h1 className="text-(length:--cf-text-hero) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            {HERO_WORD}
          </h1>
        </div>
        <div className="flex w-full flex-col items-center gap-8 animate-[enter-fade-up_0.65s_cubic-bezier(0.2,0,0,1)_0.08s_both]">
          <form className="cf-search-container" onSubmit={continueToWizard}>
            <InputSurface
              className={cn(
                files.length > 0
                  ? "min-h-[calc(var(--cf-search-panel-min-h))] gap-6 rounded-(--cf-radius-panel) p-6"
                  : "min-h-[calc(var(--cf-search-h))] py-3 px-6"
              )}
            >
              <FileCardPanel files={files} onRemove={removeFile} />
              <div className="flex min-h-10 w-full items-center gap-4">
                <button
                  aria-label="Attach PDF or Word document"
                  className="-m-1.5 flex size-(--cf-search-affordance-size) shrink-0 items-center justify-center rounded-full text-cf-text-primary transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream/10 hover:scale-110 active:scale-95"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Plus aria-hidden="true" className="size-5" />
                </button>
                <input
                  accept={DOCUMENT_PICKER_ACCEPT}
                  aria-label="Attach PDF or Word document"
                  className="hidden"
                  multiple
                  onChange={addFiles}
                  ref={fileInputRef}
                  type="file"
                />
                <Input
                  aria-label="Asset description"
                  className="cf-search-input h-10 border-0 bg-transparent px-0 shadow-none outline-none text-cf-cream focus-visible:border-0 focus-visible:ring-0"
                  style={{ fontSize: "16px" }}
                  onValueChange={(value) => {
                    setAssetDescription(value);
                  }}
                  placeholder={SEARCH_PLACEHOLDER}
                  value={assetDescription}
                />
                <button
                  aria-label="Continue"
                  className="shrink-0"
                  type="submit"
                  disabled={!searchActive}
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className={cn(
                      "size-(--cf-search-button-size) transition-[transform,filter,opacity] duration-(--cf-dur-content) ease-(--cf-ease)",
                      searchActive &&
                        "[button:hover_&]:animate-[pulse-scale_1.3s_ease-in-out_infinite]"
                    )}
                    style={
                      searchActive
                        ? {
                            filter:
                              "brightness(0) saturate(100%) invert(98%) sepia(12%) saturate(400%) hue-rotate(340deg) brightness(102%)",
                          }
                        : {}
                    }
                    src="/icons/Subtract.svg"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </InputSurface>
          </form>
          {children}
        </div>
      </div>
    </section>
  );
}

function FileCardPanel({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-wrap gap-5">
      {files.map((file, index) => (
        <div
          className="relative flex h-(--cf-file-card-h) w-full min-w-0 items-center gap-4 rounded-(--cf-radius-card) border border-cf-border-muted bg-transparent p-2.5 sm:w-(--cf-file-card-w) animate-[enter-pop_160ms_cubic-bezier(0.2,0,0,1)_both]"
          key={`${file.name}-${file.lastModified}-${file.size}`}
        >
          <div className="flex size-(--cf-file-card-tile) shrink-0 items-center justify-center rounded-(--cf-radius-segment) bg-cf-cream text-cf-text-on-accent">
            <FileText aria-hidden="true" className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="max-w-(--cf-file-card-name-w) truncate text-base text-cf-text-primary leading-none">
              {fileDisplayName(file)}
            </p>
            <p className="mt-2 text-base text-cf-border-muted leading-none">
              {documentLabel(file)}
            </p>
          </div>
          <button
            aria-label={`Remove ${file.name}`}
            className="absolute top-2 right-2 text-cf-border-muted transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease) hover:text-cf-cream"
            onClick={() => onRemove(index)}
            type="button"
          >
            <CircleX aria-hidden="true" className="size-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function LandingCategoryChips({
  categories,
}: {
  categories: PublicCategory[];
}) {
  const { selectedCategoryIds, setSelectedCategoryIds, setAssetDescription } =
    useFunnelDraft();

  function toggleCategory(category: PublicCategory) {
    const isSelected = selectedCategoryIds.includes(category.id);

    if (
      !isSelected &&
      selectedCategoryIds.length >= MAX_CATEGORIES_PER_INQUIRY
    ) {
      funnelAlert(`Pick up to ${MAX_CATEGORIES_PER_INQUIRY} categories.`);
      return;
    }

    setSelectedCategoryIds((currentIds) =>
      nextSelectedCategoryIds(currentIds, category.id)
    );

    setAssetDescription((current) => {
      if (isSelected) {
        return removeLabelFromText(current, category.label);
      }
      const trimmed = current.trim();
      return trimmed.length > 0
        ? `${trimmed}, ${category.label}`
        : category.label;
    });
  }

  return (
    <div className="cf-chip-container scrollbar-none min-h-10 min-w-0 overscroll-x-contain pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full flex-nowrap justify-center gap-4 px-1">
        {categories.map((category) => {
          const selected = selectedCategoryIds.includes(category.id);
          return (
            <Badge
              className={cn(
                "text-(length:--cf-text-base) h-(--cf-chip-h) shrink-0 rounded-full border px-4 font-normal transition-[background-color,border-color,color,transform] duration-(--cf-dur-content) ease-(--cf-ease) hover:scale-[1.04] ",
                selected
                  ? "border-transparent bg-cf-chip-bg-active text-cf-text-on-accent"
                  : "border-cf-border-muted bg-cf-chip-bg text-cf-text-on-accent hover:border-cf-border-active"
              )}
              key={category.id}
              render={
                <button
                  aria-label={`${selected ? "Remove" : "Select"} ${
                    category.label
                  }`}
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category)}
                  type="button"
                />
              }
              variant="outline"
            >
              {category.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

function removeLabelFromText(text: string, label: string): string {
  const parts = text
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p !== label);
  return parts.join(", ");
}

function nextSelectedCategoryIds(
  currentIds: string[],
  categoryId: string
): string[] {
  if (currentIds.includes(categoryId)) {
    return currentIds.filter((id) => id !== categoryId);
  }

  if (currentIds.length >= MAX_CATEGORIES_PER_INQUIRY) {
    return currentIds;
  }

  return [...currentIds, categoryId];
}

function isAllowedDocument(file: File): boolean {
  const extension = extensionOf(file.name);
  const allowedExtensions = Object.values(DOCUMENT_EXTENSION_BY_MIME);
  return (
    allowedExtensions.includes(extension) &&
    (file.type === "" ||
      ALLOWED_DOCUMENT_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number]
      ))
  );
}

function extensionOf(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex === -1 ? "" : filename.slice(dotIndex).toLowerCase();
}

function documentLabel(file: File): string {
  return DOCUMENT_LABEL_BY_EXTENSION[extensionOf(file.name)] ?? "DOC";
}

function fileDisplayName(file: File): string {
  const extension = extensionOf(file.name);
  if (extension.length === 0) {
    return file.name;
  }
  return file.name.slice(0, -extension.length);
}
