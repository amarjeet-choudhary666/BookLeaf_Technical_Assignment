import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignAdminTicket,
  classifyAdminTicket,
  createAdminNote,
  draftAdminTicketResponse,
  getAdminDashboard,
  getAdminTicket,
  getAuthorDetails,
  listAdminBooks,
  listAdminTickets,
  listAdminNotes,
  listAuthors,
  patchAdminTicket,
  postAdminReply,
  type AdminListParams,
  type AdminTicketListParams,
} from "@/services/adminService";

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  authors: (params: AdminListParams) => ["admin", "authors", params] as const,
  author: (authorId: string) => ["admin", "authors", authorId] as const,
  books: (params: AdminListParams) => ["admin", "books", params] as const,
  tickets: (params: AdminTicketListParams) =>
    ["admin", "tickets", params] as const,
  ticket: (ticketId: string) => ["admin", "tickets", ticketId] as const,
  notes: (ticketId: string) =>
    ["admin", "tickets", ticketId, "notes"] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: getAdminDashboard,
  });
}

export function useAdminAuthors(params: AdminListParams) {
  return useQuery({
    queryKey: adminKeys.authors(params),
    queryFn: () => listAuthors(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminAuthor(authorId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.author(authorId ?? ""),
    queryFn: () => getAuthorDetails(authorId!),
    enabled: !!authorId,
  });
}

export function useAdminBooks(params: AdminListParams) {
  return useQuery({
    queryKey: adminKeys.books(params),
    queryFn: () => listAdminBooks(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminTickets(params: AdminTicketListParams) {
  return useQuery({
    queryKey: adminKeys.tickets(params),
    queryFn: () => listAdminTickets(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.ticket(ticketId ?? ""),
    queryFn: () => getAdminTicket(ticketId!),
    enabled: !!ticketId,
  });
}

export function useAdminNotes(ticketId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.notes(ticketId ?? ""),
    queryFn: () => listAdminNotes(ticketId!),
    enabled: !!ticketId,
  });
}

function invalidateTicket(qc: ReturnType<typeof useQueryClient>, ticketId: string) {
  qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
  qc.invalidateQueries({ queryKey: adminKeys.ticket(ticketId) });
  qc.invalidateQueries({ queryKey: adminKeys.dashboard });
  qc.invalidateQueries({ queryKey: ["author", "tickets"] });
  qc.invalidateQueries({ queryKey: ["author", "dashboard"] });
}

export function usePatchTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      input,
    }: {
      ticketId: string;
      input: Parameters<typeof patchAdminTicket>[1];
    }) => patchAdminTicket(ticketId, input),
    onSuccess: (_data, { ticketId }) => {
      invalidateTicket(qc, ticketId);
      toast.success("Ticket updated.");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update ticket.");
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      adminId,
    }: {
      ticketId: string;
      adminId: string | null;
    }) => assignAdminTicket(ticketId, adminId),
    onSuccess: (_data, { ticketId }) => {
      invalidateTicket(qc, ticketId);
      toast.success("Ticket assignment updated.");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to assign ticket.");
    },
  });
}

export function useClassifyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => classifyAdminTicket(ticketId),
    onSuccess: (_data, ticketId) => {
      qc.invalidateQueries({ queryKey: adminKeys.ticket(ticketId) });
      toast.success("AI classification generated.");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "AI classification failed.");
    },
  });
}

export function useDraftTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => draftAdminTicketResponse(ticketId),
    onSuccess: (_data, ticketId) => {
      qc.invalidateQueries({ queryKey: adminKeys.ticket(ticketId) });
      toast.success("AI draft generated for review.");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "AI draft generation failed.");
    },
  });
}

export function usePostReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      postAdminReply(ticketId, message),
    onSuccess: (_data, { ticketId }) => {
      invalidateTicket(qc, ticketId);
      toast.success("Reply sent.");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to send reply.");
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, note }: { ticketId: string; note: string }) =>
      createAdminNote(ticketId, note),
    onSuccess: (_data, { ticketId }) => {
      qc.invalidateQueries({ queryKey: adminKeys.notes(ticketId) });
      toast.success("Internal note added.");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to add note.");
    },
  });
}
