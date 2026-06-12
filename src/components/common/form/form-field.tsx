"use client";

import { useId } from "react";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import { useController } from "react-hook-form";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ControlProps {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  disabled?: boolean;
  id: string;
}

function defaultTextareaSerialize(value: string) {
  return value;
}

interface FormFieldRenderProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  controlId: string;
  controlProps: ControlProps;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
}

type BaseFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> & {
  children: (
    props: FormFieldRenderProps<TFieldValues, TName>
  ) => React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  id?: string;
  label: React.ReactNode;
  orientation?: React.ComponentProps<typeof Field>["orientation"];
};

function fieldId(name: string, fallbackId: string) {
  return `${name.replace(/[^a-zA-Z0-9_-]+/g, "-")}-${fallbackId.replace(/:/g, "")}`;
}

function describedBy(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  children,
  className,
  control,
  defaultValue,
  description,
  disabled,
  id,
  label,
  name,
  orientation,
  rules,
  shouldUnregister,
}: BaseFormFieldProps<TFieldValues, TName>) {
  const generatedId = useId();
  const { field, fieldState } = useController({
    control,
    defaultValue,
    disabled,
    name,
    rules,
    shouldUnregister,
  });

  const controlId = id ?? fieldId(field.name, generatedId);
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = fieldState.error ? `${controlId}-error` : undefined;
  const isDisabled = disabled ?? field.disabled;

  const controlProps = {
    "aria-describedby": describedBy(descriptionId, errorId),
    "aria-invalid": fieldState.invalid || undefined,
    disabled: isDisabled,
    id: controlId,
  };

  return (
    <Field
      className={className}
      data-disabled={isDisabled || undefined}
      data-invalid={fieldState.invalid || undefined}
      disabled={isDisabled}
      orientation={orientation}
    >
      <FieldContent>
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        {description && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
      </FieldContent>
      {children({ controlId, controlProps, field, fieldState })}
      <FieldError errors={[fieldState.error]} id={errorId} />
    </Field>
  );
}

type FormInputFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  React.ComponentProps<typeof Input>,
  | "aria-describedby"
  | "aria-invalid"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "onInput"
  | "onValueChange"
  | "ref"
  | "value"
> &
  Omit<BaseFormFieldProps<TFieldValues, TName>, "children">;

function FormInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ className, ...props }: FormInputFieldProps<TFieldValues, TName>) {
  const {
    control,
    defaultValue,
    description,
    disabled,
    id,
    label,
    name,
    orientation,
    rules,
    shouldUnregister,
    ...inputProps
  } = props;

  return (
    <FormField
      className={className}
      control={control}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      id={id}
      label={label}
      name={name}
      orientation={orientation}
      rules={rules}
      shouldUnregister={shouldUnregister}
    >
      {({ controlProps, field }) => (
        <Input
          {...inputProps}
          {...controlProps}
          name={field.name}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(event.currentTarget.value)}
          ref={field.ref}
          value={field.value ?? ""}
        />
      )}
    </FormField>
  );
}

type FormTextareaFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  React.ComponentProps<typeof Textarea>,
  | "aria-describedby"
  | "aria-invalid"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "ref"
  | "value"
> &
  Omit<BaseFormFieldProps<TFieldValues, TName>, "children"> & {
    deserialize?: (value: unknown) => string;
    serialize?: (value: string) => unknown;
  };

function FormTextareaField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  className,
  deserialize = defaultTextareaDeserialize,
  serialize = defaultTextareaSerialize,
  ...props
}: FormTextareaFieldProps<TFieldValues, TName>) {
  const {
    control,
    defaultValue,
    description,
    disabled,
    id,
    label,
    name,
    orientation,
    rules,
    shouldUnregister,
    ...textareaProps
  } = props;

  return (
    <FormField
      className={className}
      control={control}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      id={id}
      label={label}
      name={name}
      orientation={orientation}
      rules={rules}
      shouldUnregister={shouldUnregister}
    >
      {({ controlProps, field }) => (
        <Textarea
          {...textareaProps}
          {...controlProps}
          name={field.name}
          onBlur={field.onBlur}
          onChange={(event) =>
            field.onChange(serialize(event.currentTarget.value))
          }
          ref={field.ref}
          value={deserialize(field.value)}
        />
      )}
    </FormField>
  );
}

interface FormRadioOption {
  description?: React.ReactNode;
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
}

type FormRadioGroupFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  React.ComponentProps<typeof RadioGroup>,
  | "aria-describedby"
  | "aria-invalid"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onValueChange"
  | "value"
> &
  Omit<BaseFormFieldProps<TFieldValues, TName>, "children"> & {
    options: FormRadioOption[];
  };

function FormRadioGroupField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ options, ...props }: FormRadioGroupFieldProps<TFieldValues, TName>) {
  const {
    className,
    control,
    defaultValue,
    description,
    disabled,
    id,
    label,
    name,
    orientation,
    rules,
    shouldUnregister,
    ...radioGroupProps
  } = props;

  return (
    <FormField
      className={className}
      control={control}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      id={id}
      label={label}
      name={name}
      orientation={orientation}
      rules={rules}
      shouldUnregister={shouldUnregister}
    >
      {({ controlId, controlProps, field, fieldState }) => (
        <RadioGroup
          {...radioGroupProps}
          {...controlProps}
          onBlur={field.onBlur}
          onValueChange={field.onChange}
          value={String(field.value ?? "")}
        >
          {options.map((option) => {
            const optionId = `${controlId}-${option.value}`;
            const optionDisabled = controlProps.disabled || option.disabled;

            return (
              <FieldLabel
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-(--cf-radius-alert) border border-border/70 p-3 font-normal has-data-checked:border-primary/30 has-data-checked:bg-primary/5",
                  optionDisabled && "cursor-not-allowed opacity-50"
                )}
                htmlFor={optionId}
                key={option.value}
              >
                <RadioGroupItem
                  aria-invalid={fieldState.invalid || undefined}
                  disabled={optionDisabled}
                  id={optionId}
                  value={option.value}
                />
                <span className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.description ? (
                    <FieldDescription>{option.description}</FieldDescription>
                  ) : null}
                </span>
              </FieldLabel>
            );
          })}
        </RadioGroup>
      )}
    </FormField>
  );
}

type FormRootErrorProps = React.ComponentProps<"div"> & {
  message?: string;
};

function FormRootError({ className, message, ...props }: FormRootErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <FieldError className={className} {...props}>
      {message}
    </FieldError>
  );
}

function FormFieldGroup(props: React.ComponentProps<typeof FieldGroup>) {
  return <FieldGroup {...props} />;
}

export type { FormFieldRenderProps, FormRadioOption };
export {
  FormField,
  FormFieldGroup,
  FormInputField,
  FormRadioGroupField,
  FormRootError,
  FormTextareaField,
};

function defaultTextareaDeserialize(value: unknown) {
  return typeof value === "string" ? value : "";
}
