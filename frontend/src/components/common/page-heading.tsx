import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeading({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink sm:text-[1.75rem] sm:leading-tight">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">{actions}</div>
      )}
    </div>
  );
}
