import type { TicketCategory, TicketPriority, TicketStatus } from "@/types";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-brand-50 text-brand-700 border-brand-200",
  in_progress: "bg-info-50 text-info-600 border-info-100",
  resolved: "bg-surface-3 text-muted border-border-strong",
  closed: "bg-surface-3 text-faint border-border",
};

export const STATUS_DOT: Record<TicketStatus, string> = {
  open: "bg-brand-500",
  in_progress: "bg-info-500",
  resolved: "bg-muted",
  closed: "bg-faint",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  royalty_payments: "Royalty & Payments",
  isbn_metadata: "ISBN & Metadata",
  printing_quality: "Printing Quality",
  distribution_availability: "Distribution & Availability",
  book_status_production: "Book Status & Production",
  general_inquiry: "General Inquiry",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_ORDER: Record<TicketPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: "bg-danger-50 text-danger-700 border-danger-100",
  high: "bg-warning-50 text-warning-600 border-warning-100",
  medium: "bg-info-50 text-info-600 border-info-100",
  low: "bg-surface-3 text-muted border-border",
};

export const PRIORITY_BAR: Record<TicketPriority, string> = {
  critical: "bg-danger-500",
  high: "bg-warning-500",
  medium: "bg-info-500",
  low: "bg-faint",
};

export const TICKET_STATUSES = Object.keys(STATUS_LABELS) as TicketStatus[];
export const TICKET_CATEGORIES = Object.keys(CATEGORY_LABELS) as TicketCategory[];
export const TICKET_PRIORITIES = Object.keys(PRIORITY_LABELS) as TicketPriority[];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Created" },
  { value: "updatedAt", label: "Last Updated" },
  { value: "priority", label: "Priority" },
] as const;

export const ORDER_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
] as const;

export const DEMO_CREDENTIALS = [
  { label: "Author", email: "author@bookleaf.local", password: "BookLeafAuthor!2026" },
  { label: "Admin", email: "admin@bookleaf.local", password: "BookLeafAdmin!2026" },
];
