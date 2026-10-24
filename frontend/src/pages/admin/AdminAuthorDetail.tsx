import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCover } from "@/components/common/book-cover";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAdminAuthor } from "@/hooks/useAdminApi";
import { initials } from "@/lib/utils";

export function AdminAuthorDetail() {
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAdminAuthor(authorId);

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const { author, books, tickets } = data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/authors")} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to authors
      </Button>

      {/* Author header */}
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials(author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-ink">{author.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {author.email}
              </span>
              {author.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {author.phone}
                </span>
              )}
              {author.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {author.city}
                </span>
              )}
              {author.joinedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Joined {format(new Date(author.joinedDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-ink">{books.length}</p>
            <p className="text-xs text-muted">Books</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-ink">{tickets.length}</p>
            <p className="text-xs text-muted">Tickets</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-brand-600" />
              Books ({books.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!books.length ? (
              <EmptyState icon={BookOpen} title="No books" description="This author has no books." />
            ) : (
              <div className="space-y-2">
                {books.map((book) => (
                  <div
                    key={book.bookId}
                    className="flex items-center gap-3 rounded-md border border-border p-2.5"
                  >
                    <BookCover title={book.title} bookId={book.bookId} className="w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{book.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        {book.isbn && <span className="font-mono">{book.isbn}</span>}
                        {book.genre && <span>{book.genre}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{book.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-brand-600" />
              Support Tickets ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!tickets.length ? (
              <EmptyState icon={User} title="No tickets" description="This author has no support tickets." />
            ) : (
              <div className="space-y-2">
                {tickets.slice(0, 10).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/admin/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{ticket.subject}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted">{ticket.ticketNumber}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={ticket.status} />
                      <span className="text-xs text-faint">
                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))}
                {tickets.length > 10 && (
                  <p className="pt-1 text-center text-xs text-muted">
                    Showing 10 of {tickets.length} tickets
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
