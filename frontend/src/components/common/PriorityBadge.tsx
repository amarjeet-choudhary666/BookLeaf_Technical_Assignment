import { cn } from "@/lib/utils";
import { PRIORITY_BAR, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import type { TicketPriority } from "@/types";

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_COLORS[priority],
        className,
      )}
    >
      <span className={cn("h-2 w-0.5 rounded-full", PRIORITY_BAR[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
