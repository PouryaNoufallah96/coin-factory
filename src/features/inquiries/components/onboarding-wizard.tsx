"use client";

import { LoaderCircle, X } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import type { z } from "zod";
import { funnelAlert } from "@/components/common/funnel-alert";
import { InputSurface } from "@/components/common/input-surface";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  optionalUrlSchema,
  type PublicQuestion,
} from "@/features/questions/schemas/question";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { createInquiry } from "../actions/create-inquiry";
import { useFunnelDraft } from "../hooks/use-funnel-draft";
import { buildAnswerPayload } from "../lib/build-answer-payload";
import {
  emailSchema,
  sanitizePhoneInput,
  whatsappSchema,
} from "../schemas/contact";
import {
  hasIntakeSignal,
  INTAKE_SIGNAL_MESSAGE,
} from "../schemas/intake-signal";
import { REQUIRED_ANSWER_MESSAGE } from "../schemas/validation-messages";

const STEPPER_SEGMENT_KEYS = [
  "stepper-segment-1",
  "stepper-segment-2",
  "stepper-segment-3",
  "stepper-segment-4",
  "stepper-segment-5",
  "stepper-segment-6",
  "stepper-segment-7",
  "stepper-segment-8",
  "stepper-segment-9",
  "stepper-segment-10",
  "stepper-segment-11",
  "stepper-segment-12",
];

const FIELD_VALIDATION_TOAST_ID = "funnel-field-validation";

function fieldError(schema: z.ZodType, value: string): string | null {
  const result = schema.safeParse(value.trim());
  return result.success ? null : (result.error.issues[0]?.message ?? null);
}

function urlError(value: string) {
  return fieldError(optionalUrlSchema, value);
}

function emailError(value: string) {
  return fieldError(emailSchema, value);
}

function whatsappError(value: string) {
  return fieldError(whatsappSchema, value);
}

interface OnboardingWizardProps {
  questions: PublicQuestion[];
}

export function OnboardingWizard({ questions }: OnboardingWizardProps) {
  const submit = useAction(createInquiry);
  const {
    answers,
    assetDescription,
    email,
    files,
    goTo,
    selectedCategoryIds,
    setAnswer,
    setEmail,
    setWhatsapp,
    step,
    whatsapp,
  } = useFunnelDraft();
  const total = questions.length;

  if (total === 0) {
    return null;
  }

  // Clamp the persisted step: an admin can disable or remove questions after a
  // draft was saved, which would otherwise index past the active set.
  const safeStep = Math.min(Math.max(step, 1), total);
  const question = questions[safeStep - 1];
  const isLastStep = safeStep === total;
  const isSubmitting = submit.isPending;

  function validateQuestion(currentQuestion: PublicQuestion) {
    if (currentQuestion.kind === "radio") {
      return answers[currentQuestion.id] ? null : REQUIRED_ANSWER_MESSAGE;
    }

    if (currentQuestion.kind === "url") {
      return urlError(answers[currentQuestion.id] ?? "");
    }

    return emailError(email) ?? whatsappError(whatsapp);
  }

  function validateSubmission() {
    if (
      !hasIntakeSignal({
        assetDescription,
        categoryIds: selectedCategoryIds,
        files,
      })
    ) {
      return INTAKE_SIGNAL_MESSAGE;
    }

    for (const currentQuestion of questions) {
      const error = validateQuestion(currentQuestion);
      if (error) {
        return error;
      }
    }

    return null;
  }

  function onBack() {
    if (safeStep === 1) {
      goTo("landing", 1, "nav-back");
      return;
    }
    goTo("onboarding", safeStep - 1, "nav-back");
  }

  function navigationError(currentQuestion: PublicQuestion): string | null {
    if (currentQuestion.kind === "url") {
      return urlError(answers[currentQuestion.id] ?? "");
    }
    if (currentQuestion.kind === "contact") {
      const emailMessage = email.trim() ? emailError(email) : null;
      if (emailMessage) {
        return emailMessage;
      }
      return whatsapp.trim() ? whatsappError(whatsapp) : null;
    }
    return null;
  }

  function onNext() {
    const error = navigationError(question);
    if (error) {
      funnelAlert(error, FIELD_VALIDATION_TOAST_ID);
      return;
    }
    goTo("onboarding", safeStep + 1, "nav-forward");
  }

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submit.isPending) {
      return;
    }

    if (!isLastStep) {
      onNext();
      return;
    }

    const validationError = validateSubmission();
    if (validationError) {
      funnelAlert(validationError);
      return;
    }

    const result = await submit.execute({
      answers: buildAnswerPayload(questions, answers),
      assetDescription: assetDescription.trim(),
      categoryIds: selectedCategoryIds,
      company: "",
      email: email.trim(),
      files,
      whatsapp: whatsapp.trim(),
    });

    if (result.status === "error") {
      funnelAlert(result.errorMessage ?? "We could not submit your inquiry.");
      return;
    }

    goTo("thank-you", 1, "nav-forward");
  }

  let submitLabel: string;
  if (isSubmitting) {
    submitLabel = "Submitting";
  } else if (isLastStep) {
    submitLabel = "Submit";
  } else {
    submitLabel = "Next";
  }

  return (
    <section className="relative flex h-[calc(100dvh-var(--cf-header-h)-var(--cf-footer-h))] min-h-0 flex-none justify-center overflow-hidden px-(--cf-page-x)">
      <form
        className="cf-content-container flex h-full min-h-0 w-full flex-col items-center text-center"
        id="wizard-form"
        noValidate
        onSubmit={onSubmit}
      >
        <WizardStepper current={safeStep} total={total} />

        <div
          className="flex h-0 min-h-0 w-full flex-1 animate-[enter-fade-up_var(--cf-dur-content)_var(--cf-ease)_both] flex-col items-center pt-(--cf-wizard-step-question-gap)"
          key={question.id}
        >
          <h1 className="text-(length:--cf-text-question) max-w-(--cf-content-w) font-light text-cf-text-primary leading-snug">
            {question.text}
          </h1>

          {question.kind === "radio" ? (
            <div className="scrollbar-none mt-(--cf-wizard-question-options-gap) h-0 min-h-0 w-full flex-1 overflow-y-scroll overscroll-contain px-1 pt-1 pb-25 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden">
              <RadioQuestion
                onChange={(value) => {
                  setAnswer(question.id, value);
                }}
                options={question.options ?? []}
                questionId={question.id}
                value={answers[question.id] ?? ""}
              />
            </div>
          ) : null}

          {question.kind === "url" ? (
            <FieldGroup className="cf-field-container mt-(--cf-wizard-question-options-gap) gap-7">
              <FunnelTextField
                label="Link"
                onChange={(value) => {
                  setAnswer(question.id, value);
                }}
                placeholder="Link"
                type="url"
                validate={urlError}
                value={answers[question.id] ?? ""}
              />
            </FieldGroup>
          ) : null}

          {question.kind === "contact" ? (
            <FieldGroup className="cf-field-container mt-(--cf-wizard-question-options-gap) gap-7">
              <FunnelTextField
                label="Email"
                onChange={(value) => {
                  setEmail(value);
                }}
                placeholder="Email"
                type="email"
                validate={emailError}
                value={email}
              />
              <FunnelTextField
                label="WhatsApp phone number"
                onChange={(value) => {
                  setWhatsapp(value);
                }}
                placeholder="WhatsApp Phone number"
                type="tel"
                validate={whatsappError}
                value={whatsapp}
              />
            </FieldGroup>
          ) : null}
        </div>
      </form>

      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-20 flex h-50 items-end px-(--cf-page-x) pb-12.5">
        <div
          aria-hidden="true"
          className="mask-[linear-gradient(to_top,black_40%,transparent_100%)] absolute inset-0 -z-10 [backdrop-filter:blur(50px)]"
        />
        <div className="cf-field-container pointer-events-auto relative z-10 flex w-full flex-row items-center justify-between">
          <Button
            className="text-(length:--cf-text-base) h-(--cf-cta-h) w-(--cf-cta-w) rounded-full border-cf-cream/70 bg-transparent font-cta text-cf-text-on-accent shadow-none transition-[background-color,border-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:border-cf-cream hover:bg-cf-cream/10 hover:text-cf-text-on-accent active:scale-[0.97]"
            disabled={isSubmitting}
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Back
          </Button>
          <Button
            aria-busy={isSubmitting}
            className="text-(length:--cf-text-base) h-(--cf-cta-h) w-(--cf-cta-w) gap-2 rounded-full bg-cf-cream-bright font-cta text-cf-text-on-accent shadow-(--cf-cta-shadow) transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream active:scale-[0.97] disabled:pointer-events-none disabled:opacity-80"
            disabled={isSubmitting}
            form="wizard-form"
            type="submit"
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : null}
            {submitLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

function WizardStepper({ current, total }: { current: number; total: number }) {
  const segmentKeys =
    total <= STEPPER_SEGMENT_KEYS.length
      ? STEPPER_SEGMENT_KEYS.slice(0, total)
      : Array.from({ length: total }, (_, index) => `segment-${index + 1}`);

  return (
    <>
      <progress className="sr-only" max={total} value={current}>
        Step {current} of {total}
      </progress>
      <div
        aria-hidden="true"
        className="flex items-center gap-(--cf-stepper-gap)"
      >
        {segmentKeys.map((key, index) => (
          <span
            className={cn(
              "h-(--cf-stepper-segment-h) w-(--cf-stepper-segment-w) rounded-(--cf-radius-segment) transition-colors duration-(--cf-dur-content) ease-(--cf-ease)",
              index < current ? "bg-cf-cream" : "bg-cf-cream/20"
            )}
            key={key}
          />
        ))}
      </div>
    </>
  );
}

function RadioQuestion({
  onChange,
  options,
  questionId,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  questionId: string;
  value: string;
}) {
  return (
    <FieldSet className="cf-field-container gap-5">
      <FieldLegend className="sr-only">Select one answer</FieldLegend>
      <RadioGroup
        className="flex flex-col gap-5"
        name={questionId}
        onValueChange={onChange}
        value={value}
      >
        {options.map((option) => {
          const selected = value === option;
          return (
            <FieldLabel
              className={cn(
                "text-(length:--cf-text-base) flex h-(--cf-row-h) w-full cursor-pointer items-center gap-4 rounded-(--cf-radius-row) border px-6 text-left font-normal transition-[background-color,border-color,box-shadow,color,transform] duration-(--cf-dur-content) ease-(--cf-ease) hover:scale-[1.015]",
                selected
                  ? cn(
                      "text-cf-cream-bright has-data-checked:border-cf-border-active has-data-checked:bg-cf-charcoal-900"
                    )
                  : "border-cf-border-muted bg-cf-surface-muted text-cf-text-primary hover:border-cf-border-active"
              )}
              key={`${questionId}-${option}`}
            >
              <RadioGroupItem
                className={cn(
                  "size-(--cf-radio-control-size) shrink-0 border transition-colors after:hidden data-checked:bg-transparent",
                  "**:data-[slot=radio-group-indicator]:size-full [&_[data-slot=radio-group-indicator]>span]:size-(--cf-radio-dot-size) [&_[data-slot=radio-group-indicator]>span]:bg-cf-cream",
                  selected ? "border-cf-cream" : "border-cf-border-muted"
                )}
                value={option}
              />
              <span className="min-w-0">{option}</span>
            </FieldLabel>
          );
        })}
      </RadioGroup>
    </FieldSet>
  );
}

function FunnelTextField({
  label,
  onChange,
  placeholder,
  type,
  validate,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  validate?: (value: string) => string | null;
  value: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const isPhone = type === "tel";

  function handleBlur() {
    setFocused(false);
    const trimmed = value.trim();
    if (trimmed && validate) {
      const error = validate(trimmed);
      if (error) {
        funnelAlert(error, FIELD_VALIDATION_TOAST_ID);
      }
    }
  }

  return (
    <Field>
      <FieldLabel
        className="text-(length:--cf-text-field-label) pl-2 font-light text-cf-text-primary leading-snug"
        htmlFor={id}
      >
        {label}
      </FieldLabel>
      <InputSurface
        className="flex h-(--cf-search-h) flex-row items-center px-7"
        filled={filled}
        focused={focused}
      >
        <Input
          className="h-full border-0 bg-transparent px-0 text-cf-cream shadow-none outline-none placeholder:text-cf-text-muted focus-visible:border-0 focus-visible:ring-0"
          id={id}
          inputMode={isPhone ? "tel" : undefined}
          onBlur={handleBlur}
          onFocus={() => setFocused(true)}
          onValueChange={(next) =>
            onChange(isPhone ? sanitizePhoneInput(next) : next)
          }
          placeholder={placeholder}
          style={{ fontSize: "16px" }}
          type={type}
          value={value}
        />
        {filled ? (
          <button
            aria-label={`Clear ${label}`}
            className="-mr-2 ml-3 flex size-11 shrink-0 items-center justify-center rounded-full text-cf-border-muted transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease) hover:text-cf-text-primary"
            onClick={() => onChange("")}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </InputSurface>
    </Field>
  );
}
