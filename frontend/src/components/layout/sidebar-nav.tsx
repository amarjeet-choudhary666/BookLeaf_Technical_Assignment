import { NavLink } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const authorNav: NavItem[] = [
  { to: "/author/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/author/books", label: "My Books", icon: BookOpen },
  { to: "/author/tickets", label: "Support Tickets", icon: LifeBuoy },
];

export const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tickets", label: "Ticket Queue", icon: LifeBuoy },
  { to: "/admin/authors", label: "Authors", icon: BookOpen },
  { to: "/admin/books", label: "Books", icon: BookOpen },
];

export function SidebarNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
