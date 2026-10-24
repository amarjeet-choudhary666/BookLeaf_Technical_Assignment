import type { tickets } from "../db/schema.ts";

export type TicketStatus = (typeof tickets.$inferSelect)["status"];

const allowedTransitions: Record<TicketStatus, readonly TicketStatus[]> = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: ["open"],
};

export function canTransitionTicket(from: TicketStatus, to: TicketStatus): boolean {
  return from === to || allowedTransitions[from].includes(to);
}
