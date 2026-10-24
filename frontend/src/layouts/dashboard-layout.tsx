import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BookMarked, X } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { adminNav, authorNav, type NavItem } from "@/components/layout/sidebar-nav";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const role = useAuthStore((s) => s.role);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const location = useLocation();

  const navItems: NavItem[] = role === "admin" ? adminNav : authorNav;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white">
          <BookMarked className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <span className="block text-sm font-semibold text-ink">BookLeaf</span>
          <span className="block text-[0.65rem] uppercase tracking-wider text-muted">
            {role === "admin" ? "Support Portal" : "Author Portal"}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        <SidebarNav items={navItems} />
      </div>
      <div className="border-t border-border px-4 py-3">
        <p className="text-[0.7rem] text-faint">
          © {new Date().getFullYear()} BookLeaf Publishing
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            className={cn(
              "absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-surface animate-slide-up",
            )}
          >
            <button
              className="absolute right-3 top-4 text-faint transition-colors hover:text-ink"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="lg:pl-60">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
