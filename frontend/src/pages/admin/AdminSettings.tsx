import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function AdminSettings() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-border/80 pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink sm:text-[1.75rem] sm:leading-tight">
          Admin Settings
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Your administrator account information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">
                {user?.email?.charAt(0).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.email?.split("@")[0] ?? "Admin"}</CardTitle>
              <p className="mt-0.5 text-sm text-muted">Administrator</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted">Email</dt>
              <dd className="mt-1 text-sm text-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Role</dt>
              <dd className="mt-1 text-sm capitalize text-ink">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">User ID</dt>
              <dd className="mt-1 font-mono text-xs text-ink">{user?.id}</dd>
            </div>
          </dl>

          <Separator className="my-4" />

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink-2">About this portal</p>
            <p className="text-sm leading-relaxed text-muted">
              The BookLeaf Author Support & Communication Portal lets administrators
              triage support tickets, classify issues with AI, review AI-generated
              replies, assign tickets, add internal notes, and resolve author issues.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
