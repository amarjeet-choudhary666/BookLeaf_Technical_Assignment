import { format } from "date-fns";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ErrorState } from "@/components/common/error-state";
import { useAuthorProfile } from "@/hooks/useAuthorApi";
import { initials } from "@/lib/utils";

export function AuthorProfile() {
  const { data: author, isLoading, isError, refetch } = useAuthorProfile();

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading || !author) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-border/80 pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink sm:text-[1.75rem] sm:leading-tight">
          My Profile
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Your author account details on file with BookLeaf.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">{initials(author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{author.name}</CardTitle>
              <p className="mt-0.5 text-sm text-muted">Author</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem icon={User} label="Author ID" value={author.authorId} mono />
            <DetailItem icon={Mail} label="Email" value={author.email} />
            <DetailItem
              icon={Phone}
              label="Phone"
              value={author.phone ?? "Not provided"}
            />
            <DetailItem
              icon={MapPin}
              label="City"
              value={author.city ?? "Not provided"}
            />
            <DetailItem
              icon={Calendar}
              label="Joined"
              value={
                author.joinedDate
                  ? format(new Date(author.joinedDate), "MMM d, yyyy")
                  : "—"
              }
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? "font-mono text-[0.8rem]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
