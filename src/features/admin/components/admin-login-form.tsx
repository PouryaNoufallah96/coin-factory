"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { FormInputField } from "@/components/common/form/form-field";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { signInAdmin } from "@/features/auth/actions/sign-in-admin";
import {
  type AdminLoginInput,
  adminLoginSchema,
} from "@/features/auth/schemas/admin-login";
import { applyActionErrorToForm, useAction } from "@/hooks/use-action";
import { ADMIN_HOME_PATH } from "@/lib/admin-redirect";

interface AdminLoginFormProps {
  redirectTo?: string;
}

export function AdminLoginForm({
  redirectTo = ADMIN_HOME_PATH,
}: AdminLoginFormProps) {
  const router = useRouter();
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    setError,
  } = useForm<AdminLoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(adminLoginSchema),
  });
  const action = useAction(signInAdmin, {
    onSuccess: ({ redirectTo: nextPath }) => {
      router.push(nextPath as Route);
    },
  });
  const isPending = isSubmitting || action.isPending;
  const serverError = errors.root?.server?.message;

  const onSubmit = handleSubmit(async () => {
    clearErrors("root");
    action.reset();
    const values = getValues();

    const result = await action.execute({
      email: values.email,
      password: values.password,
      redirectTo,
    });
    if (result.status === "error") {
      applyActionErrorToForm(setError, result.error, result.errorMessage);
    }
  });

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={onSubmit}>
      <FieldGroup>
        <FormInputField
          autoComplete="email"
          className="text-cf-text-primary"
          control={control}
          disabled={isPending}
          label="Email"
          name="email"
          placeholder="admin@coinfactory.app"
          type="email"
        />
        <FormInputField
          autoComplete="current-password"
          className="text-cf-text-primary"
          control={control}
          disabled={isPending}
          label="Password"
          name="password"
          placeholder="Password"
          type="password"
        />
      </FieldGroup>
      <FieldError>{serverError}</FieldError>
      <Button
        className="h-12 rounded-(--cf-radius-pill) bg-cf-cream px-6 font-cta text-cf-text-on-accent shadow-(--cf-cta-shadow) hover:bg-cf-cream-bright"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <Spinner aria-hidden="true" data-icon="inline-start" />
        ) : (
          <LogIn aria-hidden="true" data-icon="inline-start" />
        )}
        Sign in
      </Button>
    </form>
  );
}
