"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import {
  FormInputField,
  FormRadioGroupField,
  FormRootError,
  FormTextareaField,
} from "@/components/common/form/form-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
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
const optionLineSeparator = /\r?\n/;

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
  } = useForm<QuestionFormInput>({
    resolver: zodResolver(createQuestionInputSchema),
    values: toQuestionFormValues(question),
  });
  const kind = useWatch({ control, name: "kind" });
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
          <FormTextareaField
            control={control}
            deserialize={optionsToText}
            disabled={isPending}
            label="Options"
            name="options"
            placeholder={"Idea Stage\nActive Business\nOpen to discussion"}
            serialize={textToOptions}
          />
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

function optionsToText(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .join("\n")
    : "";
}

function textToOptions(value: string) {
  return value.split(optionLineSeparator).flatMap((option) => {
    const trimmed = option.trim();
    return trimmed ? [trimmed] : [];
  });
}
