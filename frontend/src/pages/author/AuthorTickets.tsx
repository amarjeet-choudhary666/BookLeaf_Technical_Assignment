import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/common/page-heading";
import { SearchInput } from "@/components/common/search-input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { CategoryLabel } from "@/components/common/category-label";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useMyTickets } from "@/hooks/useAuthorApi";
import { useTicketListSocket } from "@/hooks/useTicketSocket";
import {
  SORT_OPTIONS,
  ORDER_OPTIONS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  CATEGORY_LABELS,
} from "@/lib/constants";
import type { AuthorTicket, TicketCategory, TicketPriority, TicketStatus } from "@/types";

export function AuthorTickets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [sort, setSort] = useState<string>("createdAt");
  const [order, setOrder] = useState<string>("desc");
  const [page, setPage] = useState(1);

  useTicketListSocket("author");

  const { data, isLoading, isError, refetch } = useMyTickets({
    q: search || undefined,
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
    sort,
    order,
    page,
    pageSize: 10,
  });

  const hasFilters = !!(search || status || category || priority);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Support Tickets"
        description="Track and manage your support requests."
        actions={
          <Button onClick={() => navigate("/author/tickets/new")}>
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by subject…"
          onClear={() => setSearch("")}
          className="lg:w-72"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v as TicketStatus | ""); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[170px]">
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
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              {TICKET_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
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
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatus("");
                setCategory("");
                setPriority("");
                setPage(1);
              }}
            >
              Clear
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
            icon={hasFilters ? Inbox : Ticket}
            title={hasFilters ? "No matching tickets" : "No support tickets"}
            description={
              hasFilters
                ? "Try adjusting your filters or search."
                : "Raise a support ticket and it will appear here."
            }
            actionLabel={hasFilters ? undefined : "Create a ticket"}
            onAction={hasFilters ? undefined : () => navigate("/author/tickets/new")}
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="overflow-hidden">
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Ticket #</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((ticket: AuthorTicket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <Link
                          to={`/author/tickets/${ticket.id}`}
                          className="font-mono text-xs text-brand-700 hover:underline"
                        >
                          {ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/author/tickets/${ticket.id}`}
                          className="font-medium text-ink hover:text-brand-700"
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryLabel category={ticket.category} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border lg:hidden">
              {data.items.map((ticket: AuthorTicket) => (
                <Link
                  key={ticket.id}
                  to={`/author/tickets/${ticket.id}`}
                  className="block px-4 py-3 transition-colors hover:bg-surface-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-brand-700">{ticket.ticketNumber}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">{ticket.subject}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryLabel category={ticket.category} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                  </p>
                </Link>
              ))}
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
      <div className="space-y-px">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-none" />
        ))}
      </div>
    </Card>
  );
}
