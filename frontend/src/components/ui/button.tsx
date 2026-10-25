import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:enabled:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-700 text-white shadow-soft hover:bg-brand-800 hover:shadow-card",
        secondary: "bg-surface-3 text-ink-2 hover:bg-border",
        outline: "border border-border-strong bg-surface text-ink-2 shadow-soft hover:border-brand-200 hover:bg-surface-2 hover:text-ink",
        ghost: "text-ink-2 hover:bg-surface-3 hover:text-ink",
        link: "text-brand-700 underline-offset-4 hover:underline",
        danger: "bg-danger-600 text-white shadow-soft hover:bg-danger-700",
        dangerOutline:
          "border border-danger-200 bg-danger-50 text-danger-700 hover:border-danger-500 hover:bg-danger-100",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-6 text-sm",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
