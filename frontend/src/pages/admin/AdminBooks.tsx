import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading } from "@/components/common/page-heading";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { BookCover } from "@/components/common/book-cover";
import { useAdminBooks, useAdminAuthors } from "@/hooks/useAdminApi";
import { cn } from "@/lib/utils";
import type { Author, Book } from "@/types";

export function AdminBooks() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminBooks({
    q: search || undefined,
    page,
    pageSize: 12,
  });

  // Fetch authors to display author names alongside books
  const { data: authorsData } = useAdminAuthors({ pageSize: 100 });
  const authorMap = new Map(authorsData?.items.map((a: Author) => [a.authorId, a.name]));

  return (
    <div className="space-y-6">
      <PageHeading
        title="Books"
        description="Browse all published titles across authors."
      />

      <div className="flex justify-end">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by title or ISBN…"
          onClear={() => setSearch("")}
          className="w-full sm:w-80"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title={search ? "No matching books" : "No books found"}
            description={search ? "Try a different search term." : "Books will appear here once available."}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((book: Book) => (
              <Card key={book.bookId} className="overflow-hidden">
                <div className="flex gap-3 p-4">
                  <BookCover title={book.title} bookId={book.bookId} className="w-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-ink">{book.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {authorMap.get(book.authorId) ?? "Unknown author"}
                    </p>
                    <div className="mt-1.5 space-y-0.5 text-xs text-muted">
                      {book.isbn && <p className="font-mono">{book.isbn}</p>}
                      {book.genre && <p>{book.genre}</p>}
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-xs">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          book.status === "Published" ? "bg-brand-500" : "bg-warning-500",
                        )}
                      />
                      <span className="text-ink-2">{book.status}</span>
                    </p>
                  </div>
                </div>
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
