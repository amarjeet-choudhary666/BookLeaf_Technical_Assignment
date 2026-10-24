import api, { type ApiEnvelope, type Paginated } from "@/lib/api";
import type { Author, AuthorDashboard, Book } from "@/types";

export async function getAuthorDashboard(): Promise<AuthorDashboard> {
  const { data } = await api.get<ApiEnvelope<AuthorDashboard>>(
    "/authors/me/dashboard",
  );
  return data.data;
}

export async function getAuthorProfile(): Promise<Author> {
  const { data } = await api.get<ApiEnvelope<{ author: Author }>>(
    "/authors/me",
  );
  return data.data.author;
}

export interface BookListParams {
  page?: number;
  pageSize?: number;
  q?: string;
}

export async function getMyBooks(
  params: BookListParams = {},
): Promise<Paginated<Book>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Book>>>("/books", {
    params,
  });
  return data.data;
}

export async function getMyBook(bookId: string): Promise<Book> {
  const { data } = await api.get<ApiEnvelope<{ book: Book }>>(
    `/books/${bookId}`,
  );
  return data.data.book;
}
