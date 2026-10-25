import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bot,
  Clipboard,
  Clock,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  Sparkles,
  User,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { CategoryLabel } from "@/components/common/category-label";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import {
  useAdminTicket,
  useAdminNotes,
  usePatchTicket,
  useAssignTicket,
  useClassifyTicket,
  useDraftTicket,
  usePostReply,
  useCreateNote,
} from "@/hooks/useAdminApi";
import { useTicketSocket } from "@/hooks/useTicketSocket";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  STATUS_LABELS,
} from "@/lib/constants";
import { getAvailableTransitions } from "@/lib/workflow";
import { cn } from "@/lib/utils";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/types";

export function AdminTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAdminTicket(ticketId);
  useTicketSocket(ticketId);

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading || !data) return <TicketDetailSkeleton />;

  const { ticket, book, author, replies } = data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/tickets")} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to queue
      </Button>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Ticket header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="font-mono">{ticket.ticketNumber}</span>
                {author && (
                  <>
                    <span>·</span>
                    <span>{author.name}</span>
                  </>
                )}
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
                Created {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <AiAssistantSection
            key={`${ticket.id}:${ticket.aiDraftResponse ?? ""}`}
            ticketId={ticket.id}
            ticket={ticket}
          />

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!replies.length ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No replies yet"
                  description="Start the conversation by sending a reply below."
                />
              ) : (
                <div className="space-y-4">
                  {replies.map((reply) => {
                    const isAuthor = reply.senderRole === "author";
                    return (
                      <div
                        key={reply.id}
                        className={cn("flex gap-3", isAuthor ? "flex-row" : "flex-row-reverse")}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            isAuthor ? "bg-brand-100 text-brand-700" : "bg-surface-3 text-ink-2",
                          )}
                        >
                          {isAuthor ? <User className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        </div>
                        <div className={cn("max-w-[80%]", !isAuthor && "text-right")}>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="font-medium text-ink-2">
                              {isAuthor ? author?.name ?? "Author" : "You (Support)"}
                            </span>
                            <span>{format(new Date(reply.createdAt), "MMM d, h:mm a")}</span>
                          </div>
                          <div
                            className={cn(
                              "mt-1 rounded-lg px-3 py-2 text-sm",
                              !isAuthor
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

          {/* Reply composer */}
          <ReplyComposer ticketId={ticket.id} disabled={ticket.status === "closed"} />

          {/* Internal notes */}
          <InternalNotesSection ticketId={ticket.id} />
        </div>

        {/* Sidebar */}
        <div className="xl:w-72 shrink-0 space-y-4">
          <TicketSidebar
            ticket={ticket}
            author={author}
            book={book}
            ticketId={ticket.id}
          />
        </div>
      </div>
    </div>
  );
}

/* --- Sidebar with controls --- */

function TicketSidebar({
  ticket,
  author,
  book,
  ticketId,
}: {
  ticket: import("@/types").AdminTicket;
  author: { authorId: string; name: string; email: string } | null;
  book: { bookId: string; title: string; isbn: string | null } | null;
  ticketId: string;
}) {
  const patchTicket = usePatchTicket();
  const assignTicket = useAssignTicket();
  const availableStatuses = getAvailableTransitions(ticket.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Ticket Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Status control */}
        <ControlField label="Status">
          <Select
            value={ticket.status}
            onValueChange={(v) =>
              patchTicket.mutate({ ticketId, input: { status: v as TicketStatus } })
            }
            disabled={patchTicket.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.length === 0 ? (
                <SelectItem value={ticket.status}>{STATUS_LABELS[ticket.status]}</SelectItem>
              ) : (
                <>
                  <SelectItem value={ticket.status}>{STATUS_LABELS[ticket.status]} (current)</SelectItem>
                  {availableStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </ControlField>

        {/* Priority control */}
        <ControlField label="Priority">
          <Select
            value={ticket.priority}
            onValueChange={(v) =>
              patchTicket.mutate({ ticketId, input: { priority: v as TicketPriority } })
            }
            disabled={patchTicket.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ControlField>

        {/* Category control */}
        <ControlField label="Category">
          <Select
            value={ticket.category}
            onValueChange={(v) =>
              patchTicket.mutate({ ticketId, input: { category: v as TicketCategory } })
            }
            disabled={patchTicket.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ControlField>

        {/* Assignment control */}
        <ControlField label="Assignment">
          <Select
            value={ticket.assignedTo ?? "unassigned"}
            onValueChange={(v) =>
              assignTicket.mutate({
                ticketId,
                adminId: v === "unassigned" ? null : v,
              })
            }
            disabled={assignTicket.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">
                {ticket.assignedTo ? "Unassign" : "Unassigned"}
              </SelectItem>
            </SelectContent>
          </Select>
          {ticket.assignedTo && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <UserCircle className="h-3.5 w-3.5 text-brand-600" />
              Assigned to an admin
            </p>
          )}
        </ControlField>

        <Separator />

        {/* Author info */}
        {author && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted">Author</p>
            <Link
              to={`/admin/authors/${author.authorId}`}
              className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-surface-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{author.name}</p>
                <p className="truncate text-xs text-muted">{author.email}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Book info */}
        {book && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted">Related Book</p>
            <div className="rounded-md border border-border bg-surface-2 p-2.5">
              <p className="text-sm font-medium text-ink">{book.title}</p>
              {book.isbn && <p className="mt-0.5 font-mono text-xs text-muted">{book.isbn}</p>}
            </div>
          </div>
        )}

        <Separator />

        {/* Timestamps */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Created</span>
            <span className="text-ink-2">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Updated</span>
            <span className="text-ink-2">{format(new Date(ticket.updatedAt), "MMM d, yyyy")}</span>
          </div>
          {ticket.resolvedAt && (
            <div className="flex justify-between">
              <span className="text-muted">Resolved</span>
              <span className="text-ink-2">{format(new Date(ticket.resolvedAt), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ControlField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}

/* --- AI Assistant --- */

function AiAssistantSection({
  ticketId,
  ticket,
}: {
  ticketId: string;
  ticket: import("@/types").AdminTicket;
}) {
  const classify = useClassifyTicket();
  const draft = useDraftTicket();
  const [draftText, setDraftText] = useState(ticket.aiDraftResponse ?? "");

  const hasClassification = !!(ticket.aiCategory || ticket.aiPriority || ticket.aiReason);

  return (
    <Card className="border-brand-200 bg-brand-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-brand-800">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => classify.mutate(ticketId)}
            disabled={classify.isPending}
          >
            {classify.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bot className="h-3.5 w-3.5" />
            )}
            {hasClassification ? "Re-classify" : "Classify with AI"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Classification */}
        {hasClassification ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ticket.aiCategory && (
              <div className="rounded-md border border-border bg-surface p-2.5">
                <p className="text-xs text-muted">AI Category</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {CATEGORY_LABELS[ticket.aiCategory]}
                </p>
              </div>
            )}
            {ticket.aiPriority && (
              <div className="rounded-md border border-border bg-surface p-2.5">
                <p className="text-xs text-muted">AI Priority</p>
                <div className="mt-1">
                  <PriorityBadge priority={ticket.aiPriority} />
                </div>
              </div>
            )}
            {ticket.aiReason && (
              <div className="rounded-md border border-border bg-surface p-2.5 sm:col-span-1">
                <p className="text-xs text-muted">Reasoning</p>
                <p className="mt-1 text-sm text-ink-2 line-clamp-3">{ticket.aiReason}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Run AI classification to get a suggested category, priority, and reasoning for this ticket.
          </p>
        )}

        {/* Draft editor */}
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink-2">AI Draft Response</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => draft.mutate(ticketId)}
                disabled={draft.isPending}
              >
                {draft.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {draftText ? "Regenerate" : "Generate Draft"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(draftText);
                  toast.success("Draft copied to clipboard.");
                }}
                disabled={!draftText}
              >
                <Clipboard className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>
          {draftText ? (
            <Textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={6}
              className="bg-surface"
              placeholder="AI-generated draft will appear here. Edit before sending."
            />
          ) : (
            <div className="rounded-md border border-dashed border-border bg-surface p-4 text-center">
              <p className="text-sm text-muted">
                Generate an AI draft to review and edit before sending.
              </p>
            </div>
          )}
          {draftText && (
            <p className="flex items-center gap-1.5 text-xs text-gold-600">
              <Bot className="h-3 w-3" />
              AI-generated content — review and edit before sending.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* --- Reply composer --- */

function ReplyComposer({ ticketId, disabled }: { ticketId: string; disabled: boolean }) {
  const [message, setMessage] = useState("");
  const postReply = usePostReply();

  const handleSend = () => {
    if (!message.trim()) return;
    postReply.mutate(
      { ticketId, message: message.trim() },
      {
        onSuccess: () => setMessage(""),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-4 w-4 text-brand-600" />
          Public Reply
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {disabled && (
          <p className="rounded-md bg-surface-3 px-3 py-2 text-xs text-muted">
            This ticket is closed. Reopen it to send new replies.
          </p>
        )}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Type your reply to the author…"
          disabled={disabled}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || postReply.isPending || disabled}
          >
            {postReply.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* --- Internal notes --- */

function InternalNotesSection({ ticketId }: { ticketId: string }) {
  const { data: notes, isLoading } = useAdminNotes(ticketId);
  const createNote = useCreateNote();
  const [note, setNote] = useState("");

  const handleAdd = () => {
    if (!note.trim()) return;
    createNote.mutate(
      { ticketId, note: note.trim() },
      { onSuccess: () => setNote("") },
    );
  };

  return (
    <Card className="border-warning-200 bg-warning-50/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-warning-600">
          <Lock className="h-4 w-4" />
          Internal Notes
          <span className="text-xs font-normal text-muted">— Private to support team</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Add an internal note (not visible to authors)…"
            className="bg-surface"
          />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={!note.trim() || createNote.isPending}
            >
              {createNote.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add Note
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !notes?.length ? (
          <p className="py-4 text-center text-sm text-muted">No internal notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="rounded-md border border-warning-100 bg-surface p-3"
              >
                <p className="whitespace-pre-wrap text-sm text-ink-2">{n.note}</p>
                <p className="mt-2 text-xs text-faint">
                  {format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="hidden h-96 w-72 xl:block" />
      </div>
    </div>
  );
}
