import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAuthorDashboard,
  getAuthorProfile,
  getMyBook,
  getMyBooks,
  type BookListParams,
} from "@/services/bookService";
import {
  createTicket,
  getMyTicket,
  getMyTicketReplies,
  getMyBooksForSelector,
  listMyTickets,
  type TicketListParams,
} from "@/services/ticketService";

export const authorKeys = {
  dashboard: ["author", "dashboard"] as const,
  profile: ["author", "profile"] as const,
  books: (params: BookListParams) => ["author", "books", params] as const,
  book: (bookId: string) => ["author", "books", bookId] as const,
  tickets: (params: TicketListParams) => ["author", "tickets", params] as const,
  ticket: (ticketId: string) => ["author", "tickets", ticketId] as const,
  replies: (ticketId: string) =>
    ["author", "tickets", ticketId, "replies"] as const,
  booksForSelector: ["author", "books-for-selector"] as const,
};

export function useAuthorDashboard() {
  return useQuery({
    queryKey: authorKeys.dashboard,
    queryFn: getAuthorDashboard,
  });
}

export function useAuthorProfile() {
  return useQuery({ queryKey: authorKeys.profile, queryFn: getAuthorProfile });
}

export function useMyBooks(params: BookListParams) {
  return useQuery({
    queryKey: authorKeys.books(params),
    queryFn: () => getMyBooks(params),
    placeholderData: (prev) => prev,
  });
}

export function useMyBook(bookId: string | undefined) {
  return useQuery({
    queryKey: authorKeys.book(bookId ?? ""),
    queryFn: () => getMyBook(bookId!),
    enabled: !!bookId,
  });
}

export function useMyBooksForSelector() {
  return useQuery({
    queryKey: authorKeys.booksForSelector,
    queryFn: getMyBooksForSelector,
    staleTime: 60_000,
  });
}

export function useMyTickets(params: TicketListParams) {
  return useQuery({
    queryKey: authorKeys.tickets(params),
    queryFn: () => listMyTickets(params),
    placeholderData: (prev) => prev,
  });
}

export function useMyTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: authorKeys.ticket(ticketId ?? ""),
    queryFn: () => getMyTicket(ticketId!),
    enabled: !!ticketId,
  });
}

export function useMyTicketReplies(ticketId: string | undefined) {
  return useQuery({
    queryKey: authorKeys.replies(ticketId ?? ""),
    queryFn: () => getMyTicketReplies(ticketId!),
    enabled: !!ticketId,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["author", "tickets"] });
      qc.invalidateQueries({ queryKey: authorKeys.dashboard });
      toast.success("Support ticket created successfully.");
    },
  });
}
