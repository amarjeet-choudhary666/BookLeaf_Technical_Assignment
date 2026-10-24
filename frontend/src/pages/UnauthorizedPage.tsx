import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

export function UnauthorizedPage() {
  const user = useAuthStore((s) => s.user);
  const dest = user?.role === "admin" ? "/admin/dashboard" : "/author/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-50">
        <ShieldAlert className="h-7 w-7 text-warning-600" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold text-ink">Access restricted</h1>
        <p className="max-w-sm text-sm text-muted">
          You don't have permission to view this page. This area is reserved for
          a different role.
        </p>
      </div>
      <Button asChild>
        <a href={dest}>Go to your dashboard</a>
      </Button>
    </div>
  );
}
