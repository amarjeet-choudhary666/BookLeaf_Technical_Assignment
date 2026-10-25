import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink shadow-soft transition-[border-color,box-shadow] placeholder:text-faint focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-70",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
