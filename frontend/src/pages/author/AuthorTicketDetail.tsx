import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, BookOpen, Clock, Inbox, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { CategoryLabel } from "@/components/common/category-label";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useMyBook, useMyTicket, useMyTicketReplies } from "@/hooks/useAuthorApi";
import { useTicketSocket } from "@/hooks/useTicketSocket";
import { cn } from "@/lib/utils";

export function AuthorTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError, refetch } = useMyTicket(ticketId);
  const { data: replies, isLoading: repliesLoading } = useMyTicketReplies(ticketId);
  const { data: book } = useMyBook(ticket?.bookId ?? undefined);
  useTicketSocket(ticketId);

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading || !ticket) return <TicketDetailSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/author/tickets")} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Main column */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="font-mono">{ticket.ticketNumber}</span>
              </div>
              <h1 className="text-xl font-semibold leading-snug tracking-[-0.025em] text-ink">
                {ticket.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <CategoryLabel category={ticket.category} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                {ticket.description}
              </p>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-faint">
                <Clock className="h-3 w-3" />
                Opened {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </CardContent>
          </Card>

          {/* Conversation thread */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {repliesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : !replies?.length ? (
                <EmptyState
                  icon={Inbox}
                  title="No replies yet"
                  description="Our support team will respond to your ticket. You'll see updates here in real time."
                />
              ) : (
                <div className="space-y-4">
                  {replies.map((reply) => {
                    const isAuthor = reply.senderRole === "author";
                    return (
                      <div
                        key={reply.id}
                        className={cn("flex gap-3", isAuthor ? "flex-row-reverse" : "flex-row")}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            isAuthor ? "bg-brand-100 text-brand-700" : "bg-surface-3 text-ink-2",
                          )}
                        >
                          {isAuthor ? <User className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        </div>
                        <div className={cn("max-w-[80%]", isAuthor ? "text-right" : "text-left")}>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="font-medium text-ink-2">
                              {isAuthor ? "You" : "BookLeaf Support"}
                            </span>
                            <span>{format(new Date(reply.createdAt), "MMM d, h:mm a")}</span>
                          </div>
                          <div
                            className={cn(
                              "mt-1 rounded-lg px-3 py-2 text-sm",
                              isAuthor
                                ? "bg-brand-600 text-white"
                                : "bg-surface-2 text-ink-2 border border-border",
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 shrink-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm">
              <InfoRow label="Status">
                <StatusBadge status={ticket.status} />
              </InfoRow>
              <InfoRow label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </InfoRow>
              <InfoRow label="Category">
                <CategoryLabel category={ticket.category} />
              </InfoRow>
              {book && (
                <InfoRow label="Related Book">
                  <Link
                    to={`/author/books/${book.bookId}`}
                    className="flex items-center gap-1.5 text-brand-700 hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="truncate">{book.title}</span>
                  </Link>
                </InfoRow>
              )}
              {!book && ticket.bookId === null && (
                <InfoRow label="Scope">
                  <span className="text-xs text-muted">General / Account Level</span>
                </InfoRow>
              )}
              <InfoRow label="Created">
                <span className="text-xs text-muted">
                  {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                </span>
              </InfoRow>
              <InfoRow label="Updated">
                <span className="text-xs text-muted">
                  {format(new Date(ticket.updatedAt), "MMM d, yyyy")}
                </span>
              </InfoRow>
              {ticket.resolvedAt && (
                <InfoRow label="Resolved">
                  <span className="text-xs text-muted">
                    {format(new Date(ticket.resolvedAt), "MMM d, yyyy")}
                  </span>
                </InfoRow>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="hidden h-64 w-72 lg:block" />
      </div>
    </div>
  );
}
