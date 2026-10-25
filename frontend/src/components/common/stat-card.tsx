import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  className,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn("group flex min-w-0 items-center gap-3.5 px-4 py-4 sm:px-5", className)}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-3 transition-colors group-hover:bg-brand-50",
          iconColor,
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted">{label}</p>
        <p className="mt-0.5 text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] text-ink">{value}</p>
      </div>
    </Card>
  );
}
