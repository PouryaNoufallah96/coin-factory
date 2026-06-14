import { cva } from "class-variance-authority";

export const inputSurfaceVariants = cva(
  "rounded-(--cf-radius-row) border border-cf-border-muted bg-cf-charcoal-900 transition-[border-color,box-shadow] duration-(--cf-dur-content) ease-(--cf-ease) border-cf-border-active focus-within:shadow-(--cf-glow-active)",
  {
    variants: {
      active: {
        true: "border-cf-border-active shadow-(--cf-glow-active)",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
