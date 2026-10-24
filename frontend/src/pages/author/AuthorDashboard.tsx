import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Inbox,
  LifeBuoy,
  Plus,
  Ticket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import {
  useAuthorDashboard,
  useAuthorProfile,
} from "@/hooks/useAuthorApi";
import { useTicketListSocket } from "@/hooks/useTicketSocket";

export function AuthorDashboard() {
  const navigate = useNavigate();
  const { data: profile } = useAuthorProfile();
  const { data, isLoading, isError, refetch } = useAuthorDashboard();
  useTicketListSocket("author");

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} className="py-20" />;

  const greeting = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Welcome back, {greeting}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here's an overview of your books and support activity.
          </p>
        </div>
        <Button onClick={() => navigate("/author/tickets/new")}>
          <Plus className="h-4 w-4" />
          New Support Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My Books" value={data?.books ?? 0} icon={BookOpen} iconColor="text-brand-700" />
        <StatCard label="Open Tickets" value={data?.openTickets ?? 0} icon={Inbox} iconColor="text-info-600" />
        <StatCard label="Total Tickets" value={data?.tickets ?? 0} icon={LifeBuoy} iconColor="text-ink-2" />
        <StatCard label="Resolved" value={data?.resolvedTickets ?? 0} icon={CheckCircle2} iconColor="text-brand-600" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Support Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/author/tickets">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {!data?.recentTickets?.length ? (
            <EmptyState
              icon={Ticket}
              title="No tickets yet"
              description="When you raise a support ticket, it will appear here."
              actionLabel="Create a ticket"
              onAction={() => navigate("/author/tickets/new")}
            />
          ) : (
            <div className="divide-y divide-border">
              {data.recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/author/tickets/${ticket.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-surface-2 -mx-2 px-2 rounded-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {ticket.subject}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span className="font-mono">{ticket.ticketNumber}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
