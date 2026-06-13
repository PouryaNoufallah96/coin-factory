"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Plus, Trash2 } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  FormInputField,
  FormRootError,
} from "@/components/common/form/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { AdminActionErrorBanner } from "@/features/admin/components/admin-action-error-banner";
import { formatAdminDate } from "@/features/admin/lib/format-admin-date";
import { runNotificationRecipientAction } from "@/features/settings/actions/notification-recipient-actions";
import { normalizeNotificationRecipientEmail } from "@/features/settings/lib/notification-recipients";
import {
  type AdminNotificationRecipient,
  addNotificationRecipientInputSchema,
  MAX_NOTIFICATION_RECIPIENTS,
  type NotificationRecipientFormInput,
} from "@/features/settings/schemas/notification-recipient";
import { applyActionErrorToForm, useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";

interface NotificationRecipientsSettingsProps {
  recipients: AdminNotificationRecipient[];
}

type OptimisticRecipientAction =
  | { recipient: AdminNotificationRecipient; type: "add" }
  | { id: string; type: "rollbackAdd" }
  | { recipient: AdminNotificationRecipient; type: "remove" }
  | { recipient: AdminNotificationRecipient; type: "restore" };

export function NotificationRecipientsSettings({
  recipients,
}: NotificationRecipientsSettingsProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isOptimisticPending, startOptimisticTransition] = useTransition();
  const [optimisticRecipients, applyOptimisticRecipients] = useOptimistic(
    recipients,
    updateOptimisticRecipients
  );
  const action = useAction(runNotificationRecipientAction);
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm<NotificationRecipientFormInput>({
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(addNotificationRecipientInputSchema),
  });
  const isPending = action.isPending || isOptimisticPending || isSubmitting;
  const isAtCapacity =
    optimisticRecipients.length >= MAX_NOTIFICATION_RECIPIENTS;

  function applyOptimistic(update: OptimisticRecipientAction) {
    startOptimisticTransition(() => {
      applyOptimisticRecipients(update);
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    action.reset();
    setActionError(null);

    if (isAtCapacity) {
      setError("root.server", {
        message: `Keep notification recipients to ${MAX_NOTIFICATION_RECIPIENTS} or fewer.`,
        type: "server",
      });
      return;
    }

    const optimisticRecipient = {
      createdAt: new Date(),
      email: normalizeNotificationRecipientEmail(values.email),
      id: `optimistic-${crypto.randomUUID()}`,
    };
    applyOptimistic({ recipient: optimisticRecipient, type: "add" });

    const result = await action.execute({
      email: values.email,
      type: "add",
    });

    if (result.status === "error") {
      applyOptimistic({ id: optimisticRecipient.id, type: "rollbackAdd" });
      applyActionErrorToForm(setError, result.error, result.errorMessage);
      return;
    }

    reset();
  });

  async function removeRecipient(recipient: AdminNotificationRecipient) {
    clearErrors("root");
    action.reset();
    setActionError(null);
    applyOptimistic({ recipient, type: "remove" });

    const result = await action.execute({ id: recipient.id, type: "remove" });

    if (result.status === "error") {
      applyOptimistic({ recipient, type: "restore" });
      setActionError(result.errorMessage ?? "Recipient could not be removed.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-cf-cream text-sm">Settings</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
              Notification recipients
            </h1>
            <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
              Manage the internal addresses that receive new inquiry emails.
            </p>
          </div>
          <Badge className="w-fit" variant="secondary">
            {optimisticRecipients.length} / {MAX_NOTIFICATION_RECIPIENTS}
          </Badge>
        </div>
      </section>

      {actionError ? <AdminActionErrorBanner message={actionError} /> : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start">
        <form
          className="order-2 flex min-w-0 flex-col gap-5 rounded-(--cf-radius-alert) border border-cf-border-muted/40 bg-card p-4 lg:order-1"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-medium text-base text-cf-text-primary">
              Add recipient
            </h2>
            <p className="text-cf-text-muted text-sm leading-6">
              New submissions use this list immediately after it changes.
            </p>
          </div>
          <FieldGroup>
            <FormInputField
              autoComplete="email"
              control={control}
              disabled={isPending || isAtCapacity}
              label="Email"
              name="email"
              placeholder="review@coinfactory.ch"
              type="email"
            />
          </FieldGroup>
          <FormRootError message={errors.root?.server?.message} />
          <Button disabled={isPending || isAtCapacity} type="submit">
            {isPending ? (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Plus aria-hidden="true" data-icon="inline-start" />
            )}
            Add recipient
          </Button>
        </form>

        <div
          aria-busy={isPending || undefined}
          className={cn(
            "order-1 overflow-hidden rounded-(--cf-radius-alert) border border-cf-border-muted/40 bg-card transition-opacity lg:order-2",
            isPending && "animate-pulse opacity-70 motion-reduce:animate-none"
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Mail
                aria-hidden="true"
                className="size-4 shrink-0 text-cf-cream"
              />
              <h2 className="truncate font-medium text-cf-text-primary text-sm">
                Current recipients
              </h2>
            </div>
            {isPending ? <Spinner aria-label="Updating recipients" /> : null}
          </div>
          <Separator />
          {optimisticRecipients.length > 0 ? (
            <ul className="divide-y divide-cf-border-muted/40">
              {optimisticRecipients.map((recipient) => (
                <li
                  className="flex min-w-0 items-center justify-between gap-3 px-4 py-3"
                  key={recipient.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-cf-text-primary text-sm">
                      {recipient.email}
                    </p>
                    <p className="text-cf-text-muted text-xs">
                      Added {formatAdminDate(recipient.createdAt)}
                    </p>
                  </div>
                  <Button
                    aria-label={`Remove ${recipient.email}`}
                    disabled={
                      isPending || recipient.id.startsWith("optimistic-")
                    }
                    onClick={() => removeRecipient(recipient)}
                    size="icon-sm"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center text-cf-text-muted text-sm">
              No notification recipients configured.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function updateOptimisticRecipients(
  state: AdminNotificationRecipient[],
  action: OptimisticRecipientAction
) {
  switch (action.type) {
    case "add":
      return [action.recipient, ...state];
    case "rollbackAdd":
      return state.filter((recipient) => recipient.id !== action.id);
    case "remove":
      return state.filter((recipient) => recipient.id !== action.recipient.id);
    case "restore":
      return state.some((recipient) => recipient.id === action.recipient.id)
        ? state
        : [...state, action.recipient].toSorted(
            (left, right) =>
              left.createdAt.getTime() - right.createdAt.getTime()
          );
    default:
      return state;
  }
}
