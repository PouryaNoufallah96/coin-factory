"use client";

import { Plus, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { funnelAlert } from "@/components/common/funnel-alert";
import { InputSurface } from "@/components/common/input-surface";
import { Badge } from "@/components/ui/badge";
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
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useFunnelDraft } from "../hooks/use-funnel-draft";

const HERO_SUBLINE = "What do you want to";
const HERO_WORD = "Tokenize?";
const SEARCH_PLACEHOLDER =
  "e.g Oil Refinery in Indonesia, Hotel in Dubai, Gold Mine...";
const SEARCH_PLACEHOLDER_MOBILE = "Hotel in Dubai or...";

const DOCUMENT_LABEL_BY_EXTENSION: Record<string, string> = {
  ".doc": "Word",
  ".docx": "Word",
  ".pdf": "PDF",
};

export function LandingPage({ children }: { children: ReactNode }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const isDesktop = useIsDesktop();
  const {
    assetDescription,
    files,
    goTo,
    selectedCategoryIds,
    setAssetDescription,
    setFiles,
  } = useFunnelDraft();

  useEffect(() => {
    const textarea = descriptionRef.current;
    if (!textarea) {
      return;
    }
    resizeDescriptionTextarea(textarea);
  }, []);

  const searchActive =
    assetDescription.trim().length > 0 ||
    files.length > 0 ||
    selectedCategoryIds.length > 0;

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

  function onDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.target;
    setAssetDescription(textarea.value);
    resizeDescriptionTextarea(textarea);
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
    goTo("onboarding", 1, "nav-forward");
  }

  return (
    <section
      className="flex flex-1 flex-col items-center justify-start px-(--cf-page-x) pt-(--cf-landing-content-top) pb-6"
      data-funnel-resume-hide
    >
      <div className="sm:14 flex w-full flex-col items-center gap-0 sm:gap-20">
        <div className="cf-content-container flex animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <p className="text-(length:--cf-text-hero-sub) font-light text-cf-text-primary leading-none">
            {HERO_SUBLINE}
          </p>
          <h1 className="text-(length:--cf-text-hero) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            {HERO_WORD}
          </h1>
        </div>
        <div className="flex w-full flex-col items-center gap-4 sm:gap-8">
          <form
            className="cf-search-container fixed inset-x-0 bottom-0 z-20 flex animate-[enter-fade-up_0.65s_cubic-bezier(0.2,0,0,1)_0.08s_both] items-center gap-2 px-(--cf-page-x) pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:gap-3 sm:px-0 sm:pb-0"
            onSubmit={continueToWizard}
          >
            <button
              aria-label="Attach PDF or Word document"
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-cf-cream bg-cf-charcoal-900 text-cf-cream transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:scale-110 hover:bg-cf-cream/10 active:scale-95 sm:hidden"
              onClick={() => {
                if (files.length >= MAX_FILES) {
                  funnelAlert(`
                    You can attach up to ${MAX_FILES} documents.`);
                  return;
                }
                fileInputRef.current?.click();
              }}
              type="button"
            >
              <Plus aria-hidden="true" className="size-5" />
            </button>
            <InputSurface
              className={cn(
                "border-transparent py-2 sm:py-3",
                files.length > 0
                  ? "min-h-[calc(var(--cf-search-panel-min-h))] gap-6 rounded-(--cf-radius-panel) pr-0 pl-0 max-sm:rounded-[25px] sm:p-5 sm:py-4"
                  : "pr-3 pl-4 max-sm:rounded-[60px] sm:px-6 sm:py-3"
              )}
              filled={assetDescription.trim().length > 0 || files.length > 0}
              focused={inputFocused}
              style={{
                border: "1px solid transparent",
                backgroundImage:
                  "linear-gradient(var(--cf-charcoal-900), var(--cf-charcoal-900)), linear-gradient(90deg, #FFF2D1 0%, #28303F 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow: "0px 0px 200px 0px #FFFAED3D",
                ...(files.length === 0
                  ? {
                      minHeight: inputFocused
                        ? "var(--cf-search-surface-h-focused)"
                        : "var(--cf-search-surface-h)",
                    }
                  : {}),
              }}
              variant="search"
            >
              <FileCardPanel files={files} onRemove={removeFile} />
              <div
                className={cn(
                  "flex min-h-10 w-full items-center gap-4",
                  files.length > 0 && "px-3 sm:pr-0 sm:pl-0"
                )}
              >
                <button
                  aria-label="Attach PDF or Word document"
                  className="-m-1.5 hidden size-(--cf-search-affordance-size) shrink-0 items-center justify-center rounded-full text-cf-text-primary transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:scale-110 hover:bg-cf-cream/10 active:scale-95 sm:flex"
                  onClick={() => {
                    if (files.length >= MAX_FILES) {
                      funnelAlert(`
                        You can attach up to ${MAX_FILES} documents.`);
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
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
                <textarea
                  aria-label="Asset description"
                  className="cf-search-input cf-scrollbar-custom w-full resize-none border-0 bg-transparent px-0 text-cf-cream shadow-none outline-none"
                  onBlur={() => setInputFocused(false)}
                  onChange={onDescriptionChange}
                  onFocus={() => setInputFocused(true)}
                  placeholder={
                    isDesktop ? SEARCH_PLACEHOLDER : SEARCH_PLACEHOLDER_MOBILE
                  }
                  ref={descriptionRef}
                  rows={1}
                  style={{
                    fontSize: "16px",
                    overflowY: "hidden",
                    maxHeight: "96px",
                  }}
                  value={assetDescription}
                />
                <button
                  aria-label="Continue"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cf-cream/10 sm:size-auto sm:bg-transparent"
                  disabled={!searchActive}
                  type="submit"
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className={cn(
                      "size-(--cf-search-button-size) transition-[transform,filter,opacity] duration-(--cf-dur-content) ease-(--cf-ease)",
                      searchActive &&
                        "[button:hover_&]:animate-[pulse-scale_1.3s_ease-in-out_infinite]"
                    )}
                    height={24}
                    src="/icons/Subtract.svg"
                    style={
                      searchActive
                        ? {
                            filter:
                              "brightness(0) saturate(100%) invert(98%) sepia(12%) saturate(400%) hue-rotate(340deg) brightness(102%)",
                          }
                        : {}
                    }
                    width={24}
                  />
                </button>
              </div>
            </InputSurface>
          </form>
          <div aria-hidden="true" className="h-3 shrink-0 sm:hidden" />
          <div className="flex w-full animate-[enter-fade-up_0.65s_cubic-bezier(0.2,0,0,1)_0.08s_both] flex-col items-center gap-8">
            {children}
          </div>
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
    <div className="scrollbar-none flex w-full flex-nowrap gap-3 overflow-x-auto [-ms-overflow-style:none] sm:flex-wrap sm:gap-5 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
      {files.map((file, index) => (
        <div
          className="relative flex h-(--cf-file-card-h) w-fit min-w-0 shrink-0 animate-[enter-pop_160ms_cubic-bezier(0.2,0,0,1)_both] items-center gap-2 rounded-(--cf-radius-card) border border-cf-border-muted bg-transparent p-2.5 max-sm:last:mr-3 max-sm:first:ml-3 sm:w-(--cf-file-card-w) sm:gap-4"
          key={`${file.name}-${file.lastModified}-${file.size}`}
        >
          <div className="flex size-(--cf-file-card-tile) shrink-0 items-center justify-center rounded-(--cf-radius-segment) bg-cf-cream text-cf-text-on-accent">
            <Image
              alt=""
              aria-hidden="true"
              className="size-6"
              height={24}
              src="/icons/file.svg"
              width={24}
            />
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
            className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full border-none bg-[#909090] text-[#232832] transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease)"
            onClick={() => onRemove(index)}
            type="button"
          >
            <X aria-hidden="true" className="size-3" strokeWidth={3} />
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
  const { selectedCategoryIds, setSelectedCategoryIds } = useFunnelDraft();

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
  }

  return (
    <div className="cf-chip-container scrollbar-none min-h-10 min-w-0 overscroll-x-contain pb-1 [-ms-overflow-style:none] sm:overflow-x-auto [&::-webkit-scrollbar]:hidden">
      <div className="flex w-full flex-wrap justify-center gap-x-2 gap-y-4 px-1 sm:w-max sm:min-w-full sm:flex-nowrap sm:gap-4">
        {categories.map((category) => {
          const selected = selectedCategoryIds.includes(category.id);
          return (
            <Badge
              className={cn(
                "text-(length:--cf-text-base) h-(--cf-chip-h) shrink-0 rounded-full border px-4 font-normal transition-[background-color,border-color,color,transform] duration-(--cf-dur-content) ease-(--cf-ease) hover:scale-[1.04] max-sm:border-[#8F8F8F] max-sm:text-[#FFF2D1] max-sm:text-[0.9rem]",
                selected
                  ? "border-transparent bg-cf-chip-bg-active text-cf-text-on-accent max-sm:bg-[#FFF2D152]"
                  : "border-cf-border-muted bg-cf-chip-bg text-cf-text-on-accent hover:border-cf-border-active max-sm:bg-[#FFFFFF14] max-sm:hover:bg-[#FFF2D152]"
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

function resizeDescriptionTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  const capped = Math.min(textarea.scrollHeight, 96);
  textarea.style.height = `${capped}px`;
  textarea.style.overflowY = textarea.scrollHeight > 96 ? "auto" : "hidden";
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
