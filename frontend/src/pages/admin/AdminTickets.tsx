import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FilterX, Inbox, LifeBuoy, UserCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/common/page-heading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { CategoryLabel } from "@/components/common/category-label";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAdminTickets } from "@/hooks/useAdminApi";
import { useTicketListSocket } from "@/hooks/useTicketSocket";
import {
  CATEGORY_LABELS,
  ORDER_OPTIONS,
  SORT_OPTIONS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/constants";
import type {
  AdminTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types";

export function AdminTickets() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  useTicketListSocket("admin");

  const { data, isLoading, isError, refetch } = useAdminTickets({
    q: q || undefined,
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
    assignedTo: assignedTo === "unassigned" ? "" : assignedTo || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sort,
    order,
    page,
    pageSize: 15,
  });

  const hasFilters = !!(q || status || category || priority || assignedTo || dateFrom || dateTo);

  const clearAll = () => {
    setQ("");
    setStatus("");
    setCategory("");
    setPriority("");
    setAssignedTo("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Ticket Queue"
        description="Manage and triage incoming support tickets."
      />

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-border bg-surface p-3 shadow-soft sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by ticket number, subject, or description…"
            className="lg:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v as TicketStatus | ""); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => { setCategory(v as TicketCategory | ""); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => { setPriority(v as TicketPriority | ""); setPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                {TICKET_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignedTo} onValueChange={(v) => { setAssignedTo(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All assignments</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={(v) => { setOrder(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Date range:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-auto"
          />
          <span className="text-xs text-muted">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-auto"
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted">
              <FilterX className="h-3.5 w-3.5" />
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <TicketTableSkeleton />
      ) : !data?.items.length ? (
        <Card>
          <EmptyState
            icon={hasFilters ? Inbox : LifeBuoy}
            title={hasFilters ? "No matching tickets" : "No tickets in the queue"}
            description={hasFilters ? "Try adjusting your filters." : "Tickets will appear here once authors raise them."}
            actionLabel={hasFilters ? "Clear filters" : undefined}
            onAction={hasFilters ? clearAll : undefined}
          />
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted">
            <span className="font-medium text-ink-2">{data.pagination.total}</span> tickets found
          </p>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="data-table text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Ticket #</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium hidden xl:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Assigned</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((ticket: AdminTicket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/tickets/${ticket.id}`}
                          className="font-mono text-xs text-brand-700 hover:underline"
                        >
                          {ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <Link
                          to={`/admin/tickets/${ticket.id}`}
                          className="block truncate font-medium text-ink hover:text-brand-700"
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <CategoryLabel category={ticket.category} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {ticket.assignedTo ? (
                          <span className="flex items-center gap-1.5 text-xs text-ink-2">
                            <UserCircle className="h-4 w-4 text-brand-600" />
                            Assigned
                          </span>
                        ) : (
                          <span className="text-xs text-warning-600 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {data.pagination.totalPages > 1 && (
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

function TicketTableSkeleton() {
  return (
    <Card className="overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-none border-b border-border" />
      ))}
    </Card>
  );
}
