import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[96px] w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink shadow-soft transition-[border-color,box-shadow] placeholder:text-faint focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-70 scrollbar-thin",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
