import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import type { TicketReplyPayload, TicketUpdatedPayload } from "@/lib/socket";

/**
 * Joins a ticket room and reconciles incoming socket events with the
 * TanStack Query cache. Cleans up listeners on unmount.
 */
export function useTicketSocket(ticketId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!ticketId) return;
    const socket = getSocket();

    socket.emit("ticket:join", ticketId);

    const handleReply = (payload: TicketReplyPayload) => {
      if (payload.ticketId !== ticketId) return;
      qc.invalidateQueries({ queryKey: ["admin", "tickets", ticketId] });
      qc.invalidateQueries({
        queryKey: ["author", "tickets", ticketId, "replies"],
      });
    };

    const handleUpdated = (payload: TicketUpdatedPayload) => {
      if (payload.id !== ticketId) return;
      qc.invalidateQueries({ queryKey: ["admin", "tickets", ticketId] });
      qc.invalidateQueries({ queryKey: ["author", "tickets", ticketId] });
    };

    socket.on("ticket:reply", handleReply);
    socket.on("ticket:updated", handleUpdated);

    return () => {
      socket.off("ticket:reply", handleReply);
      socket.off("ticket:updated", handleUpdated);
    };
  }, [ticketId, qc]);
}

/**
 * Subscribes to global ticket list events (new tickets, updates) and
 * invalidates the relevant list queries for the dashboard views.
 */
export function useTicketListSocket(role: "author" | "admin") {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const invalidate = () => {
      if (role === "admin") {
        qc.invalidateQueries({ queryKey: ["admin"] });
      } else {
        qc.invalidateQueries({ queryKey: ["author"] });
      }
    };

    socket.on("ticket:created", invalidate);
    socket.on("ticket:updated", invalidate);
    socket.on("ticket:assigned", invalidate);

    return () => {
      socket.off("ticket:created", invalidate);
      socket.off("ticket:updated", invalidate);
      socket.off("ticket:assigned", invalidate);
    };
  }, [qc, role]);
}
