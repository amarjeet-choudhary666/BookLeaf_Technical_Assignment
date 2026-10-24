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
    <Card className={cn("flex items-center gap-4 px-5 py-4", className)}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-3",
          iconColor,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-ink">{value}</p>
      </div>
    </Card>
  );
}
