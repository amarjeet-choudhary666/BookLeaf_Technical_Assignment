import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "";

let socket: Socket | null = null;

/**
 * Returns a lazily-created singleton Socket.IO connection. The server
 * authenticates via the accessToken cookie (credentials) or a Bearer token
 * supplied in `auth.token`. Since the backend uses HttpOnly cookies, we
 * rely on `withCredentials` and omit the token parameter.
 */
export function getSocket(): Socket {
  if (socket?.connected) return socket;
  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export type TicketSocketEvent =
  | "ticket:created"
  | "ticket:updated"
  | "ticket:assigned"
  | "ticket:reply";

export interface TicketReplyPayload {
  ticketId: string;
  authorId?: string;
  reply: {
    id: string;
    message: string;
    sender: { role: "author" | "admin" };
    createdAt: string;
  };
}

export interface TicketUpdatedPayload {
  id: string;
  authorId?: string;
  status: string;
  category: string;
  priority: string;
  updatedAt: string;
}

export interface TicketAssignedPayload {
  id: string;
  authorId?: string;
  assignedTo?: string | null;
  updatedAt: string;
}

export interface TicketCreatedPayload {
  id: string;
  ticketNumber: string;
  authorId?: string;
  subject: string;
  status: string;
  createdAt: string;
}
