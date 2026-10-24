export type UserRole = "author" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  authorId: string | null;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketCategory =
  | "royalty_payments"
  | "isbn_metadata"
  | "printing_quality"
  | "distribution_availability"
  | "book_status_production"
  | "general_inquiry";
export type TicketPriority = "critical" | "high" | "medium" | "low";

export interface Author {
  authorId: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  joinedDate: string | null;
  createdAt: string;
}

export interface Book {
  bookId: string;
  authorId: string;
  title: string;
  isbn: string | null;
  genre: string | null;
  publicationDate: string | null;
  status: string;
  mrp: string | null;
  authorRoyaltyPerCopy: string | null;
  totalCopiesSold: number | null;
  totalRoyaltyEarned: string | null;
  royaltyPaid: string | null;
  royaltyPending: string | null;
  lastRoyaltyPayoutDate: string | null;
  printPartner: string | null;
  availableOn: string[] | null;
  createdAt: string;
}

export interface AuthorTicket {
  id: string;
  ticketNumber: string;
  bookId: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface AdminTicket extends AuthorTicket {
  authorId: string;
  aiCategory: TicketCategory | null;
  aiPriority: TicketPriority | null;
  aiReason: string | null;
  aiDraftResponse: string | null;
  assignedTo: string | null;
  attachmentName: string | null;
}

export interface AuthorTicketReply {
  id: string;
  message: string;
  createdAt: string;
  senderRole: UserRole;
}

export interface AdminTicketReply {
  id: string;
  senderId: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface InternalNote {
  id: string;
  ticketId: string;
  adminId: string;
  note: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface AuthorDashboard {
  books: number;
  tickets: number;
  openTickets: number;
  resolvedTickets: number;
  recentTickets: AuthorTicket[];
}

export interface AdminDashboard {
  authors: number;
  books: number;
  tickets: number;
  ticketsByStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}

export interface AiSuggestion {
  category: TicketCategory;
  priority: TicketPriority;
  reason: string;
  suggestedResponse: string;
}

export interface AdminTicketDetail {
  ticket: AdminTicket;
  book: { bookId: string; title: string; isbn: string | null } | null;
  author: { authorId: string; name: string; email: string } | null;
  replies: AdminTicketReply[];
}

export interface AuthorProfileResponse {
  author: Author;
}

export interface AdminAuthorDetail {
  author: Author;
  books: Book[];
  tickets: AdminTicket[];
}
