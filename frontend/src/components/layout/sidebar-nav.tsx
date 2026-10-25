import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/layout/nav-items";

export function SidebarNav({
  items,
  collapsed = false,
}: {
  items: NavItem[];
  collapsed?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={collapsed ? item.label : undefined}
          aria-label={item.label}
          className={({ isActive }) =>
            cn(
              "relative flex min-h-10 items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-[0.8125rem] font-medium transition-[background-color,color,border-color] duration-150",
              collapsed && "justify-center px-0",
              isActive
                ? "border-brand-600 bg-brand-50 text-brand-800"
                : "border-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
