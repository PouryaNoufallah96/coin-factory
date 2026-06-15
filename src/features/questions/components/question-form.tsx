"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Save } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  FormInputField,
  FormRadioGroupField,
  FormRootError,
} from "@/components/common/form/form-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  createQuestion,
  updateQuestion,
} from "@/features/questions/actions/admin-question-actions";
import {
  type AdminQuestion,
  createQuestionInputSchema,
  type QuestionFormInput,
  type QuestionKind,
} from "@/features/questions/schemas/question";
import { applyActionErrorToForm, useAction } from "@/hooks/use-action";

interface QuestionFormProps {
  onSuccess: () => void;
  question?: Pick<AdminQuestion, "id" | "kind" | "options" | "text">;
}

const kindOptions = [
  { label: "Radio", value: "radio" },
  { label: "URL", value: "url" },
  { label: "Contact", value: "contact" },
];

export function QuestionForm({ onSuccess, question }: QuestionFormProps) {
  const createAction = useAction(createQuestion);
  const updateAction = useAction(updateQuestion);
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    setError,
    setValue,
  } = useForm<QuestionFormInput>({
    resolver: zodResolver(createQuestionInputSchema),
    values: toQuestionFormValues(question),
  });
  const kind = useWatch({ control, name: "kind" });
  const options = useWatch({ control, name: "options" }) as string[] | null;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const initialOptionsLength =
    question?.kind === "radio" ? (question.options?.length ?? 0) : 0;
  const keyCounterRef = useRef(initialOptionsLength);
  const [stableKeys, setStableKeys] = useState<number[]>(() =>
    Array.from({ length: initialOptionsLength }, (_, i) => i)
  );

  const currentOptions = options ?? [];

  const isPending =
    isSubmitting || createAction.isPending || updateAction.isPending;

  const onSubmit = handleSubmit(async () => {
    clearErrors("root");
    createAction.reset();
    updateAction.reset();
    const values = getValues();

    const payload = {
      kind: values.kind,
      options: values.kind === "radio" ? values.options : null,
      text: values.text,
    };
    const result = question
      ? await updateAction.execute({ id: question.id, ...payload })
      : await createAction.execute(payload);

    if (result.status === "error") {
      applyActionErrorToForm(setError, result.error, result.errorMessage);
      return;
    }

    onSuccess();
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <FieldGroup>
        <FormInputField
          autoComplete="off"
          control={control}
          disabled={isPending}
          label="Question"
          name="text"
          placeholder="What stage is your project currently in?"
        />
        <FormRadioGroupField
          control={control}
          disabled={isPending}
          label="Type"
          name="kind"
          options={kindOptions}
        />
        {kind === "radio" ? (
          <div className="flex flex-col gap-2">
            <Label>Options</Label>
            {currentOptions.map((option, index) => {
              const itemError = (
                errors.options as
                  | Record<number, { message?: string }>
                  | undefined
              )?.[index]?.message;
              return (
                <div className="flex flex-col gap-1" key={stableKeys[index]}>
                  <div className="flex items-center gap-2">
                    <Input
                      aria-invalid={!!itemError}
                      disabled={isPending}
                      onChange={(e) => {
                        const next = [...currentOptions];
                        next[index] = e.target.value;
                        setValue("options", next, { shouldValidate: true });
                      }}
                      placeholder={`Option ${index + 1}`}
                      ref={(el) => {
                        inputRefs.current[index] =
                          el as HTMLInputElement | null;
                      }}
                      value={option}
                    />
                    <button
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      disabled={isPending}
                      onClick={() => {
                        const next = currentOptions.filter(
                          (_, i) => i !== index
                        );
                        setStableKeys((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setValue("options", next.length ? next : null, {
                          shouldValidate: true,
                        });
                      }}
                      type="button"
                    >
                      <Minus className="size-4" />
                    </button>
                  </div>
                  {itemError && (
                    <p className="text-destructive text-sm">{itemError}</p>
                  )}
                </div>
              );
            })}
            {typeof errors.options?.message === "string" && (
              <p className="text-destructive text-sm">
                {errors.options.message}
              </p>
            )}
            <button
              className="flex items-center justify-center gap-2 rounded-md border border-border border-dashed py-2 text-muted-foreground text-sm transition-colors hover:border-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => {
                const next = [...currentOptions, ""];
                setValue("options", next);
                setStableKeys((prev) => [...prev, keyCounterRef.current++]);
                const newIndex = next.length - 1;
                setTimeout(() => inputRefs.current[newIndex]?.focus(), 0);
              }}
              type="button"
            >
              <Plus className="size-4" />
              Add option
            </button>
          </div>
        ) : null}
      </FieldGroup>
      <FormRootError message={errors.root?.server?.message} />
      <Button disabled={isPending} type="submit">
        {isPending ? (
          <Spinner aria-hidden="true" data-icon="inline-start" />
        ) : (
          <Save aria-hidden="true" data-icon="inline-start" />
        )}
        Save question
      </Button>
    </form>
  );
}

function toQuestionFormValues(
  question?: Pick<AdminQuestion, "kind" | "options" | "text">
): QuestionFormInput {
  return {
    kind: (question?.kind ?? "radio") as QuestionKind,
    options: question?.kind === "radio" ? (question.options ?? []) : null,
    text: question?.text ?? "",
  };
}
