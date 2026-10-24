import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useLogout } from "@/hooks/useAuth";
import { initials } from "@/lib/utils";

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const logout = useLogout();
  const navigate = useNavigate();

  const displayName = user?.email.split("@")[0] ?? "User";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden flex-1 lg:block" />

      <div className="flex items-center gap-2">
        {user?.role === "author" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/author/tickets/new")}
            className="hidden sm:flex"
          >
            <UserIcon className="h-3.5 w-3.5" />
            New Ticket
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-ink">
                  {displayName}
                </span>
                <span className="block text-xs capitalize leading-tight text-muted">
                  {user?.role}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium text-ink">
                {displayName}
              </span>
              <span className="block text-xs text-muted">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  user?.role === "admin"
                    ? "/admin/settings"
                    : "/author/profile",
                )
              }
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-danger-600 focus:text-danger-700"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
