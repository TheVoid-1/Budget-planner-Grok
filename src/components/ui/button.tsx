import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-[background-color,color,box-shadow,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        secondary: "bg-surface text-fg shadow-card hover:bg-inset",
        ghost: "bg-transparent text-fg hover:bg-inset",
        danger: "bg-surface text-danger shadow-card hover:bg-inset",
      },
      size: {
        md: "min-h-11 px-4",
        icon: "size-11 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
