import type { TicketStatus } from "@/types";

const ALLOWED_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: ["open"],
};

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return from === to || ALLOWED_TRANSITIONS[from].includes(to);
}

export function getAvailableTransitions(current: TicketStatus): TicketStatus[] {
  return [...ALLOWED_TRANSITIONS[current]];
}
