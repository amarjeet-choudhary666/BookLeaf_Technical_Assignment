import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCover } from "@/components/common/book-cover";
import { ErrorState } from "@/components/common/error-state";
import { useMyBook } from "@/hooks/useAuthorApi";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function AuthorBookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { data: book, isLoading, isError, refetch } = useMyBook(bookId);

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading || !book) return <BookDetailSkeleton />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/author/books")} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to books
      </Button>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: cover + actions */}
        <div className="lg:w-56 shrink-0 space-y-4">
          <BookCover title={book.title} bookId={book.bookId} className="w-full max-w-48" />
          <Button
            className="w-full"
            variant="outline"
            onClick={() => navigate(`/author/tickets/new?bookId=${book.bookId}`)}
          >
            <Plus className="h-4 w-4" />
            Raise a ticket
          </Button>
        </div>

        {/* Right: details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{book.title}</h1>
            <p className="mt-1 text-sm text-muted">
              <span
                className={
                  book.status === "Published"
                    ? "text-brand-700 font-medium"
                    : "text-warning-600 font-medium"
                }
              >
                {book.status}
              </span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label="ISBN" value={book.isbn ?? "—"} mono />
                <DetailRow label="Genre" value={book.genre ?? "—"} />
                <DetailRow
                  label="Publication Date"
                  value={
                    book.publicationDate
                      ? format(new Date(book.publicationDate), "MMM d, yyyy")
                      : "—"
                  }
                />
                <DetailRow label="Print Partner" value={book.printPartner ?? "—"} />
                <DetailRow
                  label="Available On"
                  value={
                    book.availableOn?.length ? book.availableOn.join(", ") : "—"
                  }
                />
                <DetailRow label="Book ID" value={book.bookId} mono />
              </dl>
            </CardContent>
          </Card>

          {/* Royalty section — only when data exists */}
          {(book.mrp || book.authorRoyaltyPerCopy || book.totalRoyaltyEarned || book.royaltyPaid || book.royaltyPending) && (
            <Card>
              <CardHeader>
                <CardTitle>Royalty Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailRow label="MRP" value={formatCurrency(book.mrp)} />
                  <DetailRow
                    label="Royalty / Copy"
                    value={formatCurrency(book.authorRoyaltyPerCopy)}
                  />
                  <DetailRow
                    label="Copies Sold"
                    value={formatNumber(book.totalCopiesSold)}
                  />
                  <DetailRow
                    label="Total Royalty Earned"
                    value={formatCurrency(book.totalRoyaltyEarned)}
                  />
                  <DetailRow
                    label="Royalty Paid"
                    value={formatCurrency(book.royaltyPaid)}
                  />
                  <DetailRow
                    label="Royalty Pending"
                    value={formatCurrency(book.royaltyPending)}
                  />
                  {book.lastRoyaltyPayoutDate && (
                    <DetailRow
                      label="Last Payout"
                      value={format(new Date(book.lastRoyaltyPayoutDate), "MMM d, yyyy")}
                    />
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd
        className={`mt-0.5 text-sm text-ink ${mono ? "font-mono text-[0.8rem]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-6">
        <Skeleton className="h-72 w-48" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
