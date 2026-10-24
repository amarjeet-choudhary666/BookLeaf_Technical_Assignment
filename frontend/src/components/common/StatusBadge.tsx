import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_DOT, STATUS_LABELS } from "@/lib/constants";
import type { TicketStatus } from "@/types";

export function StatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
