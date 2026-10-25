import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { BookCover } from "@/components/common/book-cover";
import { useMyBooks } from "@/hooks/useAuthorApi";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

export function AuthorBooks() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useMyBooks({
    q: search || undefined,
    page,
    pageSize: 12,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink sm:text-[1.75rem] sm:leading-tight">
            My Books
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            Your published titles and publishing status.
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by title…"
          onClear={() => setSearch("")}
          className="sm:w-72"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <BookGridSkeleton />
      ) : !data?.items.length ? (
        <EmptyState
          icon={BookOpen}
          title={search ? "No matching books" : "No books yet"}
          description={
            search
              ? "Try a different search term."
              : "Your published books will appear here once they're available."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((book: Book) => (
              <Card key={book.bookId} className="overflow-hidden">
                <Link
                  to={`/author/books/${book.bookId}`}
                  className="flex gap-4 p-4 transition-colors hover:bg-surface-2"
                >
                  <BookCover title={book.title} bookId={book.bookId} className="w-20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-ink">
                      {book.title}
                    </p>
                    <div className="mt-1.5 space-y-0.5 text-xs text-muted">
                      {book.isbn && (
                        <p className="font-mono">ISBN: {book.isbn}</p>
                      )}
                      {book.genre && <p>{book.genre}</p>}
                      <p className="flex items-center gap-1">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            book.status === "Published"
                              ? "bg-brand-500"
                              : "bg-warning-500",
                          )}
                        />
                        {book.status}
                      </p>
                    </div>
                    <p className="mt-2 text-[0.7rem] text-faint">
                      Added {formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
