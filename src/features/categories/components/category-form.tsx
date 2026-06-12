"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  FormInputField,
  FormRootError,
} from "@/components/common/form/form-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  createCategory,
  updateCategory,
} from "@/features/categories/actions/admin-category-actions";
import {
  type AdminCategory,
  type CategoryFormInput,
  createCategoryInputSchema,
} from "@/features/categories/schemas/category";
import { applyActionErrorToForm, useAction } from "@/hooks/use-action";

interface CategoryFormProps {
  category?: Pick<AdminCategory, "id" | "label">;
  onSuccess: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const createAction = useAction(createCategory);
  const updateAction = useAction(updateCategory);
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    setError,
  } = useForm<CategoryFormInput>({
    defaultValues: {
      label: category?.label ?? "",
    },
    resolver: zodResolver(createCategoryInputSchema),
  });
  const isPending =
    isSubmitting || createAction.isPending || updateAction.isPending;

  const onSubmit = handleSubmit(async () => {
    clearErrors("root");
    createAction.reset();
    updateAction.reset();
    const values = getValues();

    const result = category
      ? await updateAction.execute({ id: category.id, ...values })
      : await createAction.execute(values);

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
          label="Label"
          name="label"
          placeholder="Gold Mine"
        />
      </FieldGroup>
      <FormRootError message={errors.root?.server?.message} />
      <Button disabled={isPending} type="submit">
        {isPending ? (
          <Spinner aria-hidden="true" data-icon="inline-start" />
        ) : (
          <Save aria-hidden="true" data-icon="inline-start" />
        )}
        Save category
      </Button>
    </form>
  );
}
