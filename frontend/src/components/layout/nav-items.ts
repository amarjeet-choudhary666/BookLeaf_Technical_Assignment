import {
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

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
