import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BookMarked } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { adminNav, authorNav, type NavItem } from "@/components/layout/nav-items";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

function SidebarContent({
  role,
  collapsed,
}: {
  role: "author" | "admin" | null;
  collapsed: boolean;
}) {
  const navItems: NavItem[] = role === "admin" ? adminNav : authorNav;

  return (
    <>
      <div
        className={cn(
          "flex h-[76px] shrink-0 items-center border-b border-border/80",
          collapsed ? "justify-center px-2" : "gap-3 px-5",
        )}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white shadow-soft"
          title="BookLeaf"
        >
          <BookMarked className="h-[19px] w-[19px]" strokeWidth={1.8} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <span className="block text-[0.9375rem] font-semibold tracking-[-0.025em] text-ink">
              BookLeaf
            </span>
            <span className="mt-1 block text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {role === "admin" ? "Support workspace" : "Author workspace"}
            </span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex-1 overflow-y-auto py-5 scrollbar-thin",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {!collapsed && (
          <p className="mb-2 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.13em] text-faint">
            Workspace
          </p>
        )}
        <SidebarNav items={navItems} collapsed={collapsed} />
      </div>
      <div
        className={cn(
          "shrink-0 border-t border-border/80 py-4",
          collapsed ? "flex justify-center px-2" : "px-5",
        )}
      >
        {!collapsed && (
          <>
            <p className="text-xs font-medium text-ink-2">BookLeaf Publishing</p>
            <p className="mt-0.5 text-[0.6875rem] text-muted">
              © {new Date().getFullYear()} · {role === "admin" ? "Support" : "Author"} portal
            </p>
          </>
        )}
      </div>
    </>
  );
}

export function DashboardLayout() {
  const role = useAuthStore((s) => s.role);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  return (
    <div
      className={cn(
        "min-h-screen bg-canvas transition-[padding] duration-200",
        sidebarCollapsed ? "lg:pl-[4.5rem]" : "lg:pl-60",
      )}
    >
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-lg bg-surface px-4 py-2 text-sm font-medium text-ink shadow-elevated focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <aside
        id="primary-sidebar"
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
          sidebarCollapsed ? "w-[4.5rem]" : "w-60",
        )}
      >
        <SidebarContent role={role} collapsed={sidebarCollapsed} />
      </aside>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          id="mobile-navigation"
          className="mobile-nav-panel"
          overlayClassName="lg:hidden"
        >
          <DialogTitle className="sr-only">Main navigation</DialogTitle>
          <SidebarContent role={role} collapsed={false} />
        </DialogContent>
      </Dialog>

      <div className="min-w-0">
        <AppHeader />
        <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
