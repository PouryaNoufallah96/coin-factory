"use client";

import type {
  ActionableClient,
  ActionableClientRest,
  ActionableError,
} from "@orpc/server";
import { useState, useTransition } from "react";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

type ActionStatus = "idle" | "pending" | "success" | "error";

interface ActionState<TOutput, TError> {
  data?: TOutput;
  error?: TError | Error;
  errorMessage?: string;
  status: ActionStatus;
}

interface UseActionOptions<TOutput, TError> {
  getErrorMessage?: (error: TError | Error) => string;
  onError?: (error: TError | Error) => void;
  onSettled?: (state: ActionState<TOutput, TError>) => void;
  onSuccess?: (data: TOutput) => void;
}

type FieldErrorRecord = Record<string, string | string[] | undefined>;

const idleState = {
  status: "idle",
} satisfies ActionState<unknown, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstMessage(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }

  return;
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!isRecord(error)) {
    return "Something went wrong. Please try again.";
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  if (isRecord(error.data)) {
    const dataMessage = firstMessage(error.data.message);
    if (dataMessage) {
      return dataMessage;
    }

    const fieldErrors = extractFieldErrors(error);
    const fieldMessage =
      fieldErrors && Object.values(fieldErrors).map(firstMessage).find(Boolean);
    if (fieldMessage) {
      return fieldMessage;
    }
  }

  return "Something went wrong. Please try again.";
}

function extractFieldErrors(error: unknown): FieldErrorRecord | undefined {
  const candidates: unknown[] = [];

  if (isRecord(error)) {
    candidates.push(error.fieldErrors, error.errors);
    if (isRecord(error.data)) {
      candidates.push(error.data.fieldErrors, error.data.errors);
    }
  }

  for (const candidate of candidates) {
    if (!isRecord(candidate)) {
      continue;
    }

    const entries = Object.entries(candidate).filter(([, value]) =>
      Boolean(firstMessage(value))
    );

    if (entries.length > 0) {
      return Object.fromEntries(entries) as FieldErrorRecord;
    }
  }

  return;
}

function applyActionErrorToForm<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  error: unknown,
  rootMessage = getActionErrorMessage(error)
) {
  const fieldErrors = extractFieldErrors(error);

  if (fieldErrors) {
    for (const [fieldName, messages] of Object.entries(fieldErrors)) {
      const message = firstMessage(messages);
      if (!message) {
        continue;
      }

      setError(fieldName as FieldPath<TFieldValues>, {
        message,
        type: "server",
      });
    }
    return;
  }

  setError("root.server", {
    message: rootMessage,
    type: "server",
  });
}

function useAction<TInput, TOutput, TError extends ActionableError<unknown>>(
  action: ActionableClient<TInput, TOutput, TError>,
  options: UseActionOptions<TOutput, TError> = {}
) {
  const [state, setState] = useState<ActionState<TOutput, TError>>(idleState);
  const [isTransitionPending, startTransition] = useTransition();

  const reset = () => setState(idleState);

  const execute = (...input: ActionableClientRest<TInput>) =>
    new Promise<ActionState<TOutput, TError>>((resolve) => {
      startTransition(() => {
        setState({ status: "pending" });
      });

      action(...input)
        .then(([error, data]) => {
          if (error) {
            const nextState: ActionState<TOutput, TError> = {
              error,
              errorMessage:
                options.getErrorMessage?.(error) ??
                getActionErrorMessage(error),
              status: "error",
            };

            startTransition(() => setState(nextState));
            options.onError?.(error);
            options.onSettled?.(nextState);
            resolve(nextState);
            return;
          }

          if (data === undefined) {
            const actionError = new Error("Action returned no data.");
            const nextState: ActionState<TOutput, TError> = {
              error: actionError,
              errorMessage: getActionErrorMessage(actionError),
              status: "error",
            };

            startTransition(() => setState(nextState));
            options.onError?.(actionError);
            options.onSettled?.(nextState);
            resolve(nextState);
            return;
          }

          const nextState: ActionState<TOutput, TError> = {
            data,
            status: "success",
          };

          startTransition(() => setState(nextState));
          options.onSuccess?.(data);
          options.onSettled?.(nextState);
          resolve(nextState);
        })
        .catch((cause: unknown) => {
          const error =
            cause instanceof Error ? cause : new Error("Action failed.");
          const nextState: ActionState<TOutput, TError> = {
            error,
            errorMessage:
              options.getErrorMessage?.(error) ?? getActionErrorMessage(error),
            status: "error",
          };

          startTransition(() => setState(nextState));
          options.onError?.(error);
          options.onSettled?.(nextState);
          resolve(nextState);
        });
    });

  return {
    ...state,
    execute,
    isPending: state.status === "pending" || isTransitionPending,
    reset,
  };
}

export type { ActionState, ActionStatus, UseActionOptions };
export {
  applyActionErrorToForm,
  extractFieldErrors,
  getActionErrorMessage,
  useAction,
};
