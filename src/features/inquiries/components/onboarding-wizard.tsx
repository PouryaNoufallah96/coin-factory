/// <reference types="react/canary" />

"use client";

import { X } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type React from "react";
import {
  addTransitionType,
  startTransition,
  useId,
  ViewTransition,
} from "react";
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
import { emailSchema, whatsappSchema } from "../schemas/contact";
import {
  hasIntakeSignal,
  INTAKE_SIGNAL_MESSAGE,
} from "../schemas/intake-signal";
import { REQUIRED_ANSWER_MESSAGE } from "../schemas/validation-messages";

const WIZARD_PROGRESS_TRANSITION = {
  "nav-back": "wizard-progress",
  "nav-forward": "wizard-progress",
  default: "none",
} as const;

const WIZARD_QUESTION_TRANSITION = {
  "nav-back": "wizard-question-back",
  "nav-forward": "wizard-question-forward",
  default: "none",
} as const;

const WIZARD_ACTIONS_TRANSITION = {
  "nav-back": "wizard-actions",
  "nav-forward": "wizard-actions",
  default: "none",
} as const;

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

interface OnboardingWizardProps {
  questions: PublicQuestion[];
  step: number;
}

export function OnboardingWizard({ questions, step }: OnboardingWizardProps) {
  const router = useRouter();
  const submit = useAction(createInquiry);
  const question = questions[step - 1];
  const total = questions.length;
  const isLastStep = step === total;
  const {
    answers,
    assetDescription,
    email,
    files,
    selectedCategoryIds,
    setAnswer,
    setEmail,
    setWhatsapp,
    whatsapp,
  } = useFunnelDraft();

  function goTo(href: Route, direction: "nav-back" | "nav-forward") {
    startTransition(() => {
      addTransitionType(direction);
      router.push(href);
    });
  }

  function validateQuestion(currentQuestion: PublicQuestion) {
    const value = answers[currentQuestion.id] ?? "";

    if (currentQuestion.kind === "radio") {
      return value ? null : REQUIRED_ANSWER_MESSAGE;
    }

    if (currentQuestion.kind === "url") {
      const result = optionalUrlSchema.safeParse(value.trim());
      return result.success ? null : result.error.issues[0]?.message;
    }

    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      return emailResult.error.issues[0]?.message;
    }

    const whatsappResult = whatsappSchema.safeParse(whatsapp.trim());
    if (!whatsappResult.success) {
      return whatsappResult.error.issues[0]?.message;
    }

    return null;
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
    if (step === 1) {
      goTo("/" as Route, "nav-back");
      return;
    }
    goTo(`/onboarding/${step - 1}` as Route, "nav-back");
  }

  function onNext() {
    goTo(`/onboarding/${step + 1}` as Route, "nav-forward");
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

    goTo("/thank-you" as Route, "nav-forward");
  }

  return (
    <section className="relative flex flex-1 justify-center px-(--cf-page-x) py-6">
      <form
        className="cf-content-container flex w-full flex-col items-center text-center"
        onSubmit={onSubmit}
      >
        <ViewTransition
          default="none"
          key={`wizard-progress-${step}`}
          name="wizard-progress"
          share={WIZARD_PROGRESS_TRANSITION}
        >
          <WizardStepper current={step} total={total} />
        </ViewTransition>

        <ViewTransition
          default="none"
          key={`wizard-question-${question.id}`}
          name="wizard-question"
          share={WIZARD_QUESTION_TRANSITION}
        >
          <div className="flex w-full flex-col items-center pt-(--cf-wizard-step-question-gap)">
            <h1 className="text-(length:--cf-text-question) max-w-(--cf-content-w) font-light text-cf-text-primary leading-snug">
              {question.text}
            </h1>

            {question.kind === "radio" ? (
              <div className="mt-(--cf-wizard-question-options-gap) w-full">
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
                  value={email}
                />
                <FunnelTextField
                  label="WhatsApp phone number"
                  onChange={(value) => {
                    setWhatsapp(value);

                  }}
                  placeholder="WhatsApp Phone number"
                  type="tel"
                  value={whatsapp}
                />
              </FieldGroup>
            ) : null}
          </div>
        </ViewTransition>

        <div aria-hidden="true" className="h-12 w-full shrink-0" />

        <ViewTransition
          default="none"
          key={`wizard-actions-${step}`}
          name="wizard-actions"
          share={WIZARD_ACTIONS_TRANSITION}
        >
          <div className="cf-field-container mb-(--cf-wizard-actions-bottom) flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="text-(length:--cf-text-base) h-(--cf-cta-h) w-full rounded-full border-cf-cream/70 bg-transparent font-cta text-cf-text-on-accent shadow-none transition-[background-color,border-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:border-cf-cream hover:bg-cf-cream/10 hover:text-cf-text-on-accent active:scale-[0.97] sm:w-(--cf-cta-w)"
              onClick={onBack}
              type="button"
              variant="outline"
            >
              Back
            </Button>
            <Button
              aria-busy={submit.isPending}
              className="text-(length:--cf-text-base) h-(--cf-cta-h) w-full rounded-full bg-cf-cream-bright font-cta text-cf-text-on-accent shadow-(--cf-cta-shadow) transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream active:scale-[0.97] sm:w-(--cf-cta-w)"
              type="submit"
            >
              {isLastStep ? "Submit" : "Next"}
            </Button>
          </div>
        </ViewTransition>
      </form>
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
                "text-(length:--cf-text-base) flex h-(--cf-row-h) w-full cursor-pointer items-center gap-4 px-6 text-left font-normal transition-[background-color,border-color,box-shadow,color,transform] duration-(--cf-dur-content) ease-(--cf-ease) hover:scale-[1.015] active:scale-[0.985]",
                selected
                  ? cn(
                      "text-cf-cream-bright has-data-checked:border-cf-border-active has-data-checked:bg-cf-charcoal-900"
                    )
                  : "rounded-(--cf-radius-row) border border-cf-border-muted bg-cf-surface-muted text-cf-text-primary hover:border-cf-border-active"
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
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  value: string;
}) {
  const id = useId();
  const active = value.length > 0;

  return (
    <Field>
      <FieldLabel
        className="text-(length:--cf-text-field-label) pl-2 font-light text-cf-text-primary leading-snug"
        htmlFor={id}
      >
        {label}
      </FieldLabel>
      <InputSurface
        active={active}
        className="flex h-(--cf-search-h) items-center px-7"
      >
        <Input
          className="text-(length:--cf-text-lg) h-full border-0 bg-transparent px-0 text-cf-cream shadow-none outline-none placeholder:text-cf-text-muted focus-visible:border-0 focus-visible:ring-0"
          id={id}
          onValueChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {active ? (
          <button
            aria-label={`Clear ${label}`}
            className="-mr-2 ml-3 flex size-9 shrink-0 items-center justify-center rounded-full text-cf-border-muted transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease) hover:text-cf-text-primary"
            onClick={() => onChange("")}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            <X aria-hidden="true" className="size-3" />
          </button>
        ) : null}
      </InputSurface>
    </Field>
  );
}
