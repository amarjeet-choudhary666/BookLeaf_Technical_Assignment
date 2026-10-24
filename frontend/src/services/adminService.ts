import api, { type ApiEnvelope, type Paginated } from "@/lib/api";
import type {
  AdminAuthorDetail,
  AdminDashboard,
  AdminTicket,
  AdminTicketDetail,
  AiSuggestion,
  Author,
  Book,
  InternalNote,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await api.get<ApiEnvelope<AdminDashboard>>("/admin/dashboard");
  return data.data;
}

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  authorId?: string;
}

export async function listAuthors(
  params: AdminListParams = {},
): Promise<Paginated<Author>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Author>>>(
    "/admin/authors",
    { params },
  );
  return data.data;
}

export async function getAuthorDetails(
  authorId: string,
): Promise<AdminAuthorDetail> {
  const { data } = await api.get<ApiEnvelope<AdminAuthorDetail>>(
    `/admin/authors/${authorId}`,
  );
  return data.data;
}

export async function listAdminBooks(
  params: AdminListParams = {},
): Promise<Paginated<Book>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Book>>>(
    "/admin/books",
    { params },
  );
  return data.data;
}

export interface AdminTicketListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  sort?: string;
  order?: string;
}

export async function listAdminTickets(
  params: AdminTicketListParams = {},
): Promise<Paginated<AdminTicket>> {
  const { data } = await api.get<ApiEnvelope<Paginated<AdminTicket>>>(
    "/admin/tickets",
    { params },
  );
  return data.data;
}

export async function getAdminTicket(
  ticketId: string,
): Promise<AdminTicketDetail> {
  const { data } = await api.get<ApiEnvelope<AdminTicketDetail>>(
    `/admin/tickets/${ticketId}`,
  );
  return data.data;
}

export async function patchAdminTicket(
  ticketId: string,
  input: Partial<{
    status: TicketStatus;
    category: TicketCategory;
    priority: TicketPriority;
    assignedTo: string | null;
  }>,
): Promise<AdminTicket> {
  const { data } = await api.patch<ApiEnvelope<{ ticket: AdminTicket }>>(
    `/admin/tickets/${ticketId}`,
    input,
  );
  return data.data.ticket;
}

export async function assignAdminTicket(
  ticketId: string,
  adminId: string | null,
): Promise<AdminTicket> {
  const { data } = await api.post<ApiEnvelope<{ ticket: AdminTicket }>>(
    `/admin/tickets/${ticketId}/assign`,
    { adminId },
  );
  return data.data.ticket;
}

export async function classifyAdminTicket(
  ticketId: string,
): Promise<{ suggestion: AiSuggestion; ticket: AdminTicket }> {
  const { data } = await api.post<
    ApiEnvelope<{ suggestion: AiSuggestion; ticket: AdminTicket }>
  >(`/admin/tickets/${ticketId}/classify`);
  return data.data;
}

export async function draftAdminTicketResponse(
  ticketId: string,
): Promise<{ draft: string; ticket: AdminTicket }> {
  const { data } = await api.post<
    ApiEnvelope<{ draft: string; ticket: AdminTicket }>
  >(`/admin/tickets/${ticketId}/draft`);
  return data.data;
}

export async function postAdminReply(
  ticketId: string,
  message: string,
): Promise<void> {
  await api.post(`/admin/tickets/${ticketId}/replies`, { message });
}

export async function listAdminNotes(
  ticketId: string,
): Promise<InternalNote[]> {
  const { data } = await api.get<ApiEnvelope<{ items: InternalNote[] }>>(
    `/admin/tickets/${ticketId}/notes`,
  );
  return data.data.items;
}

export async function createAdminNote(
  ticketId: string,
  note: string,
): Promise<void> {
  await api.post(`/admin/tickets/${ticketId}/notes`, { note });
}
