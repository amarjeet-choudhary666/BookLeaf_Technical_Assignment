import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  CheckCircle2,
  CircleDot,
  Inbox,
  LifeBuoy,
  PlayCircle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAdminDashboard, useAdminTickets } from "@/hooks/useAdminApi";
import { useTicketListSocket } from "@/hooks/useTicketSocket";
import { STATUS_LABELS } from "@/lib/constants";
import type { AdminTicket } from "@/types";

const PIE_COLORS: Record<string, string> = {
  open: "#10b981",
  in_progress: "#3b82f6",
  resolved: "#a3a29a",
  closed: "#d4d2cc",
};

export function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();
  const { data: recentData } = useAdminTickets({ page: 1, pageSize: 6, sort: "updatedAt" });
  useTicketListSocket("admin");

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} className="py-20" />;

  const statusData = data
    ? Object.entries(data.ticketsByStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key as keyof typeof STATUS_LABELS] ?? key,
        key,
        value,
      }))
    : [];

  const totalTickets = data?.tickets ?? 0;
  const openTickets = data?.ticketsByStatus.open ?? 0;
  const inProgress = data?.ticketsByStatus.in_progress ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Support queue overview and ticket trends.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/tickets">
            <LifeBuoy className="h-4 w-4" />
            Open Ticket Queue
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Tickets" value={totalTickets} icon={Inbox} iconColor="text-ink-2" />
        <StatCard label="Open" value={openTickets} icon={CircleDot} iconColor="text-brand-700" />
        <StatCard label="In Progress" value={inProgress} icon={PlayCircle} iconColor="text-info-600" />
        <StatCard label="Resolved" value={data?.ticketsByStatus.resolved ?? 0} icon={CheckCircle2} iconColor="text-brand-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Status distribution bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} barCategoryGap="20%">
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#73736b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#73736b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell key={entry.key} fill={PIE_COLORS[entry.key] ?? "#d4d2cc"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status donut */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.key} fill={PIE_COLORS[entry.key] ?? "#d4d2cc"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold text-ink">{totalTickets}</span>
                <span className="text-xs text-muted">Total</span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {statusData.map((s) => (
                <div key={s.key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PIE_COLORS[s.key] }}
                    />
                    {s.name}
                  </span>
                  <span className="font-medium text-ink-2">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Authors" value={data?.authors ?? 0} icon={Users} iconColor="text-brand-700" />
        <StatCard label="Total Books" value={data?.books ?? 0} icon={BookOpen} iconColor="text-gold-600" />
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Ticket Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tickets">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {!recentData?.items.length ? (
            <EmptyState
              icon={Inbox}
              title="No tickets yet"
              description="Tickets will appear here once authors start raising them."
            />
          ) : (
            <div className="divide-y divide-border">
              {recentData.items.map((ticket: AdminTicket) => (
                <Link
                  key={ticket.id}
                  to={`/admin/tickets/${ticket.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-surface-2 -mx-2 px-2 rounded-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {ticket.subject}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {ticket.ticketNumber}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-muted sm:block">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
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
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
