import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading } from "@/components/common/page-heading";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAdminAuthors } from "@/hooks/useAdminApi";
import { initials } from "@/lib/utils";
import type { Author } from "@/types";

export function AdminAuthors() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminAuthors({
    q: search || undefined,
    page,
    pageSize: 12,
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Authors"
        description="Browse and manage author accounts."
      />

      <div className="flex justify-end">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          onClear={() => setSearch("")}
          className="w-full sm:w-80"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? "No matching authors" : "No authors found"}
            description={search ? "Try a different search term." : "Authors will appear here once seeded."}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((author: Author) => (
              <Link key={author.authorId} to={`/admin/authors/${author.authorId}`}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-2 hover:border-brand-200">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="text-sm">{initials(author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{author.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                      <Mail className="h-3 w-3" />
                      {author.email}
                    </p>
                    {author.city && (
                      <p className="mt-0.5 text-xs text-faint">{author.city}</p>
                    )}
                  </div>
                </Card>
              </Link>
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
