import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { TicketCategory } from "@/types";

export function CategoryLabel({
  category,
  className,
}: {
  category: TicketCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-surface-3 px-2 py-0.5 text-xs font-medium text-ink-2",
        className,
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
