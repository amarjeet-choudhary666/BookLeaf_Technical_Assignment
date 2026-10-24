import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

export function NotFoundPage() {
  const user = useAuthStore((s) => s.user);
  const dest = user
    ? user.role === "admin"
      ? "/admin/dashboard"
      : "/author/dashboard"
    : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-3">
        <Compass className="h-7 w-7 text-muted" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
        <p className="max-w-sm text-sm text-muted">
          The page you're looking for doesn't exist or may have moved.
        </p>
      </div>
      <Button asChild>
        <a href={dest}>Back to safety</a>
      </Button>
    </div>
  );
}
