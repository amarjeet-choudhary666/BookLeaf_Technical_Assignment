import api, { type ApiEnvelope, type Paginated } from "@/lib/api";
import type { AuthorTicket, AuthorTicketReply, Book } from "@/types";

export interface TicketListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  category?: string;
  priority?: string;
  sort?: string;
  order?: string;
}

export async function listMyTickets(
  params: TicketListParams = {},
): Promise<Paginated<AuthorTicket>> {
  const { data } = await api.get<ApiEnvelope<Paginated<AuthorTicket>>>(
    "/tickets",
    { params },
  );
  return data.data;
}

export async function createTicket(input: {
  subject: string;
  description: string;
  bookId?: string | null;
}): Promise<AuthorTicket> {
  const { data } = await api.post<ApiEnvelope<{ ticket: AuthorTicket }>>(
    "/tickets",
    input,
  );
  return data.data.ticket;
}

export async function getMyTicket(ticketId: string): Promise<AuthorTicket> {
  const { data } = await api.get<ApiEnvelope<{ ticket: AuthorTicket }>>(
    `/tickets/${ticketId}`,
  );
  return data.data.ticket;
}

export async function getMyTicketReplies(
  ticketId: string,
): Promise<AuthorTicketReply[]> {
  const { data } = await api.get<ApiEnvelope<{ items: AuthorTicketReply[] }>>(
    `/tickets/${ticketId}/replies`,
  );
  return data.data.items;
}

export async function getMyBooksForSelector(): Promise<Book[]> {
  const { data } = await api.get<ApiEnvelope<Paginated<Book>>>("/books", {
    params: { pageSize: 100 },
  });
  return data.data.items;
}
