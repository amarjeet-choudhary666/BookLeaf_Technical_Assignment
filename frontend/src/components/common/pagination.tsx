import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pagination as PaginationType } from "@/types";

export function Pagination({
  pagination,
  onPageChange,
  className,
}: {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const { page, totalPages, total } = pagination;
  if (total === 0) return null;

  const from = (page - 1) * pagination.pageSize + 1;
  const to = Math.min(page * pagination.pageSize, total);

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${
        className ?? ""
      }`}
    >
      <p className="text-xs text-muted">
        Showing <span className="font-medium text-ink-2">{from}</span>–
        <span className="font-medium text-ink-2">{to}</span> of{" "}
        <span className="font-medium text-ink-2">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <span className="text-sm text-muted">
          Page <span className="font-medium text-ink-2">{page}</span> of{" "}
          {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
