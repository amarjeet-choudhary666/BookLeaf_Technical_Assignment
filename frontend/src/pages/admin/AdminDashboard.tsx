import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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
import { PageHeading } from "@/components/common/page-heading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAdminDashboard, useAdminTickets } from "@/hooks/useAdminApi";
import { useTicketListSocket } from "@/hooks/useTicketSocket";
import { STATUS_LABELS } from "@/lib/constants";
import type { AdminTicket } from "@/types";

const PIE_COLORS: Record<string, string> = {
  open: "#33895b",
  in_progress: "#3b82f6",
  resolved: "#8e9a92",
  closed: "#dce3dd",
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
      <PageHeading
        title="Operations dashboard"
        description="A live view of support activity across BookLeaf."
        actions={
          <Button asChild>
            <Link to="/admin/tickets">
              <LifeBuoy className="h-4 w-4" />
              Open ticket queue
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total tickets" value={totalTickets} icon={Inbox} iconColor="text-ink-2" />
        <StatCard label="Open" value={openTickets} icon={CircleDot} iconColor="text-brand-700" />
        <StatCard label="In progress" value={inProgress} icon={PlayCircle} iconColor="text-info-600" />
        <StatCard label="Resolved" value={data?.ticketsByStatus.resolved ?? 0} icon={CheckCircle2} iconColor="text-brand-600" />
        <StatCard label="Authors" value={data?.authors ?? 0} icon={Users} iconColor="text-brand-700" />
        <StatCard label="Books" value={data?.books ?? 0} icon={BookOpen} iconColor="text-gold-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets by status</CardTitle>
            <p className="mt-1 text-xs text-muted">Current volume across the support queue</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} barCategoryGap="24%" margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e4eae5" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6c7971" }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6c7971" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8faf8" }}
                    contentStyle={{
                      border: "1px solid #e4eae5",
                      borderRadius: 10,
                      boxShadow: "0 8px 24px rgb(21 39 29 / 10%)",
                      fontSize: 12,
                    }}
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

        <Card>
          <CardHeader>
            <CardTitle>Queue distribution</CardTitle>
            <p className="mt-1 text-xs text-muted">Tickets grouped by current status</p>
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
                    stroke="white"
                    strokeWidth={3}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.key} fill={PIE_COLORS[entry.key] ?? "#d4d2cc"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e4eae5",
                      borderRadius: 10,
                      boxShadow: "0 8px 24px rgb(21 39 29 / 10%)",
                      fontSize: 12,
                    }}
                  />
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

      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Recent ticket activity</CardTitle>
            <p className="mt-1 text-xs text-muted">Latest updates from the support queue</p>
          </div>
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
