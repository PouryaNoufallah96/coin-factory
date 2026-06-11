"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  createContext,
  type FormEvent,
  type ReactNode,
  use,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { INTAKE_SIGNAL_MESSAGE } from "@/features/inquiries/schemas/intake-signal";
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

const LandingAlertContext = createContext<
  ((message: string | null) => void) | null
>(null);

function MaskIcon({ className, src }: { className?: string; src: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block bg-current", className)}
      data-slot="mask-icon"
      style={{
        WebkitMask: `url("${src}") center / contain no-repeat`,
        mask: `url("${src}") center / contain no-repeat`,
      }}
    />
  );
}

export function LandingPage({ children }: { children: ReactNode }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    assetDescription,
    files,
    selectedCategoryIds,
    setAssetDescription,
    setFiles,
  } = useFunnelDraft();

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const pickedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (pickedFiles.length === 0) {
      return;
    }

    const nextFiles = [...files];
    for (const file of pickedFiles) {
      if (nextFiles.length >= MAX_FILES) {
        setError(`Attach up to ${MAX_FILES} documents.`);
        return;
      }
      if (!isAllowedDocument(file)) {
        setError(`${file.name} is not a PDF or Word document.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`${file.name} is larger than 5 MB.`);
        return;
      }
      nextFiles.push(file);
    }

    setFiles(nextFiles);
    setError(null);
  }

  function removeFile(index: number) {
    setFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function continueToWizard(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (
      assetDescription.trim().length === 0 &&
      files.length === 0 &&
      selectedCategoryIds.length === 0
    ) {
      setError(INTAKE_SIGNAL_MESSAGE);
      return;
    }
    setError(null);
    router.push("/onboarding/1" as Route);
  }

  return (
    <LandingAlertContext.Provider value={setError}>
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-3 sm:px-10 lg:px-(--cf-page-x)">
        <div className="flex w-full flex-col items-center gap-10 sm:gap-14">
          {error ? <LandingAlert message={error} /> : null}
          <div className="cf-content-container flex flex-col items-center gap-6 text-center">
            <p className="font-light text-3xl text-cf-text-primary leading-none sm:text-[36px]">
              {HERO_SUBLINE}
            </p>
            <h1 className="font-bold text-6xl text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none sm:text-[96px]">
              {HERO_WORD}
            </h1>
          </div>
          <div className="flex w-full flex-col items-center gap-8">
            <form className="cf-search-container" onSubmit={continueToWizard}>
              <div
                className={cn(
                  "flex w-full flex-col justify-center bg-cf-charcoal-900 text-cf-cream shadow-(--cf-glow-active) transition-[border-color,border-radius,box-shadow,padding] duration-(--cf-dur-content) ease-(--cf-ease)",
                  files.length > 0
                    ? "min-h-[216px] gap-6 rounded-(--cf-radius-panel) border border-cf-border-active p-6"
                    : "min-h-(--cf-search-h) rounded-(--cf-radius-row) border border-cf-border-active py-5 pr-5 pl-6"
                )}
              >
                <FileCardPanel files={files} onRemove={removeFile} />
                <div className="flex min-h-10 w-full items-center gap-4">
                  <button
                    aria-label="Attach PDF or Word document"
                    className="-m-1.5 flex size-10 shrink-0 items-center justify-center rounded-full text-cf-text-primary transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream/10"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <MaskIcon className="size-4" src="/brand/icon-plus.svg" />
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
                    className="h-10 border-0 bg-transparent px-0 text-cf-cream text-lg shadow-none outline-none placeholder:text-cf-text-muted focus-visible:border-0 focus-visible:ring-0 md:text-xl"
                    onChange={(event) => {
                      setAssetDescription(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder={SEARCH_PLACEHOLDER}
                    value={assetDescription}
                  />
                  <Button
                    aria-label="Continue"
                    className="size-12 shrink-0 rounded-full bg-cf-cream text-cf-charcoal-900 shadow-(--cf-cta-shadow) transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream-bright active:translate-y-0 active:scale-[0.97] **:data-[slot=mask-icon]:size-5"
                    size="icon"
                    type="submit"
                  >
                    <MaskIcon src="/brand/icon-target.svg" />
                  </Button>
                </div>
              </div>
            </form>
            {children}
          </div>
        </div>
      </section>
    </LandingAlertContext.Provider>
  );
}

function LandingAlert({ message }: { message: string }) {
  return (
    <div className="cf-field-container flex min-h-14 items-center gap-3 rounded-(--cf-radius-alert) bg-cf-error px-4 text-cf-text-on-error">
      <MaskIcon
        className="h-[18px] w-5 shrink-0"
        src="/brand/icon-warning.svg"
      />
      <p className="text-sm sm:text-base">{message}</p>
    </div>
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
          className="relative flex h-[68px] w-full min-w-0 items-center gap-4 rounded-(--cf-radius-card) border border-cf-border-muted bg-transparent p-2.5 sm:w-[241px]"
          key={`${file.name}-${file.lastModified}-${file.size}`}
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-cf-cream text-cf-text-on-accent">
            <MaskIcon className="h-6 w-[22px]" src="/brand/icon-invoice.svg" />
          </div>
          <div className="min-w-0">
            <p className="max-w-[130px] truncate text-base text-cf-text-primary leading-none">
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
            <MaskIcon className="size-5" src="/brand/icon-remove-circle.svg" />
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
  const setLandingAlert = useLandingAlert();
  const { selectedCategoryIds, setSelectedCategoryIds } = useFunnelDraft();

  function toggleCategory(category: PublicCategory) {
    if (
      selectedCategoryIds.length >= MAX_CATEGORIES_PER_INQUIRY &&
      !selectedCategoryIds.includes(category.id)
    ) {
      setLandingAlert(`Pick up to ${MAX_CATEGORIES_PER_INQUIRY} categories.`);
      return;
    }

    setSelectedCategoryIds((currentIds) =>
      nextSelectedCategoryIds(currentIds, category.id)
    );
    setLandingAlert(null);
  }

  return (
    <div className="cf-chip-container scrollbar-none min-h-10 min-w-0 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full flex-nowrap justify-center gap-4 px-1">
        {categories.map((category) => {
          const selected = selectedCategoryIds.includes(category.id);
          return (
            <Badge
              className={cn(
                "h-[35px] shrink-0 rounded-full border px-[18px] font-normal text-base transition-[background-color,border-color,color] duration-(--cf-dur-content) ease-(--cf-ease)",
                selected
                  ? "border-transparent bg-cf-chip-bg-active text-cf-text-on-accent"
                  : "border-cf-border-muted bg-cf-chip-bg text-cf-text-on-accent hover:border-cf-border-active"
              )}
              key={category.id}
              render={
                <button
                  aria-label={`${selected ? "Remove" : "Select"} ${category.label}`}
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

function useLandingAlert() {
  const setLandingAlert = use(LandingAlertContext);
  if (!setLandingAlert) {
    throw new Error("useLandingAlert must be used inside LandingPage");
  }
  return setLandingAlert;
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
