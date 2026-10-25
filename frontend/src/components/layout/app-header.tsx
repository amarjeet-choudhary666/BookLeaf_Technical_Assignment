import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  UserRound,
} from "lucide-react";
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

function getPageTitle(pathname: string) {
  const exactTitles: Record<string, string> = {
    "/author/dashboard": "Dashboard",
    "/author/books": "My books",
    "/author/tickets": "Support tickets",
    "/author/tickets/new": "New support ticket",
    "/author/profile": "Profile",
    "/admin/dashboard": "Dashboard",
    "/admin/tickets": "Ticket queue",
    "/admin/authors": "Authors",
    "/admin/books": "Books",
    "/admin/settings": "Settings",
  };
  if (exactTitles[pathname]) return exactTitles[pathname];
  if (pathname.startsWith("/author/books/")) return "Book details";
  if (pathname.startsWith("/author/tickets/")) return "Ticket details";
  if (pathname.startsWith("/admin/tickets/")) return "Ticket details";
  if (pathname.startsWith("/admin/authors/")) return "Author details";
  return "Workspace";
}

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.email.split("@")[0] ?? "User";
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border/90 bg-surface/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
        >
          <Menu className="h-[18px] w-[18px]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden shrink-0 text-muted lg:inline-flex"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          aria-controls="primary-sidebar"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </Button>

        <div className="min-w-0">
          <p className="hidden text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted sm:block">
            {role === "admin" ? "Support operations" : "Author workspace"}
          </p>
          <p className="truncate text-sm font-semibold tracking-[-0.015em] text-ink sm:mt-0.5">
            {pageTitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {role === "author" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/author/tickets/new")}
            className="hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-xl border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-border hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              aria-label={`Open ${displayName} account menu`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials(displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-36 text-left sm:block">
                <span className="block truncate text-xs font-semibold leading-tight text-ink">
                  {displayName}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] capitalize leading-tight text-muted">
                  {role}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-semibold text-ink">{displayName}</span>
              <span className="mt-0.5 block truncate text-xs text-muted">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  role === "admin" ? "/admin/settings" : "/author/profile",
                )
              }
            >
              <UserRound className="h-4 w-4" />
              {role === "admin" ? "Settings" : "Your profile"}
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
