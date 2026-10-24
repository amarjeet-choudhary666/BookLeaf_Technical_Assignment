import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { tickets, users } from "../db/schema.ts";
import { ACCESS_TOKEN_COOKIE } from "../utils/authSession.ts";
import { verifyAccessToken } from "../utils/jwt.ts";

type SocketUser = {
  id: string;
  role: "author" | "admin";
  authorId: string | null;
};

let io: Server | undefined;

function cookieToken(cookieHeader = ""): string | undefined {
  for (const part of cookieHeader.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === ACCESS_TOKEN_COOKIE && value.length) {
      try {
        return decodeURIComponent(value.join("="));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function socketToken(socket: Socket): string | undefined {
  const authorization = socket.handshake.headers.authorization;
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const authToken = socket.handshake.auth?.token;
  return bearer ?? (typeof authToken === "string" ? authToken : undefined) ??
    cookieToken(socket.handshake.headers.cookie);
}

export function attachRealtime(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
      ].filter((origin): origin is string => Boolean(origin)),
      credentials: true,
    },
    maxHttpBufferSize: 32 * 1024,
  });

  io.use(async (socket, next) => {
    const token = socketToken(socket);
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      if (
        typeof payload !== "object" ||
        payload === null ||
        typeof payload.userId !== "string"
      ) {
        next(new Error("Unauthorized"));
        return;
      }
      const [user] = await getDb()
        .select({
          id: users.id,
          role: users.role,
          authorId: users.authorId,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);
      if (!user?.isActive || (user.role === "author" && !user.authorId)) {
        next(new Error("Unauthorized"));
        return;
      }
      socket.data.authUser = {
        id: user.id,
        role: user.role,
        authorId: user.authorId,
      } satisfies SocketUser;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.authUser as SocketUser;
    if (user.role === "admin") socket.join("admins");
    if (user.role === "author" && user.authorId) {
      socket.join(`author:${user.authorId}`);
    }

    socket.on("ticket:join", async (value: unknown, acknowledgement?: (result: { ok: boolean }) => void) => {
      const ticketId =
        typeof value === "string"
          ? value
          : typeof value === "object" && value !== null && "ticketId" in value
            ? (value as { ticketId?: unknown }).ticketId
            : undefined;
      const acknowledge =
        typeof acknowledgement === "function" ? acknowledgement : undefined;
      if (
        typeof ticketId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ticketId)
      ) {
        acknowledge?.({ ok: false });
        return;
      }

      try {
        const where =
          user.role === "author" && user.authorId
            ? and(eq(tickets.id, ticketId), eq(tickets.authorId, user.authorId))
            : eq(tickets.id, ticketId);
        const [ticket] = await getDb()
          .select({ id: tickets.id })
          .from(tickets)
          .where(where)
          .limit(1);
        if (!ticket) {
          acknowledge?.({ ok: false });
          return;
        }
        await socket.join(`ticket:${ticketId}`);
        acknowledge?.({ ok: true });
      } catch {
        acknowledge?.({ ok: false });
        return;
      }
    });
  });

  return io;
}

export function emitTicketCreated(ticket: {
  id: string;
  ticketNumber: string;
  authorId: string;
  subject: string;
  status: string;
  createdAt: Date;
}) {
  const event = {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
  io?.to("admins").emit("ticket:created", { ...event, authorId: ticket.authorId });
  io?.to(`author:${ticket.authorId}`).emit("ticket:created", event);
}

export function emitTicketUpdated(ticket: {
  id: string;
  authorId: string;
  status: string;
  category: string;
  priority: string;
  updatedAt: Date;
}) {
  const event = {
    id: ticket.id,
    status: ticket.status,
    category: ticket.category,
    priority: ticket.priority,
    updatedAt: ticket.updatedAt,
  };
  io?.to("admins").emit("ticket:updated", { ...event, authorId: ticket.authorId });
  io?.to(`author:${ticket.authorId}`).emit("ticket:updated", event);
  io?.to(`ticket:${ticket.id}`).emit("ticket:updated", event);
}

export function emitTicketAssigned(ticket: {
  id: string;
  authorId: string;
  assignedTo: string | null;
  updatedAt: Date;
}) {
  const event = { id: ticket.id, assignedTo: ticket.assignedTo, updatedAt: ticket.updatedAt };
  io?.to("admins").emit("ticket:assigned", { ...event, authorId: ticket.authorId });
  const authorEvent = toAuthorAssignmentEvent(ticket);
  io?.to(`author:${ticket.authorId}`).emit("ticket:assigned", authorEvent);
  io?.to(`ticket:${ticket.id}`).emit("ticket:assigned", authorEvent);
}

export function toAuthorAssignmentEvent(ticket: { id: string; updatedAt: Date }) {
  return { id: ticket.id, updatedAt: ticket.updatedAt };
}

export function toPublicReplyEvent(reply: {
  id: string;
  message: string;
  senderRole: "author" | "admin";
  createdAt: Date;
}) {
  return {
    id: reply.id,
    message: reply.message,
    sender: { role: reply.senderRole },
    createdAt: reply.createdAt,
  };
}

export function emitPublicReply(reply: {
  ticketId: string;
  authorId: string;
  id: string;
  message: string;
  senderId: string;
  senderRole: "author" | "admin";
  createdAt: Date;
}) {
  const event = toPublicReplyEvent(reply);
  io?.to("admins").emit("ticket:reply", { ticketId: reply.ticketId, authorId: reply.authorId, reply: event });
  io?.to(`author:${reply.authorId}`).emit("ticket:reply", { ticketId: reply.ticketId, reply: event });
  io?.to(`ticket:${reply.ticketId}`).emit("ticket:reply", { ticketId: reply.ticketId, reply: event });
}

