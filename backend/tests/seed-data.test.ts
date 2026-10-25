import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type SampleBook = {
  bookId: string;
  title: string;
  status: string;
};

type SampleAuthor = {
  authorId: string;
  name: string;
  email: string;
  books: SampleBook[];
};

describe("bundled seed dataset", () => {
  it("contains 10 authors and 18 books with valid author references", async () => {
    const filePath = path.resolve(process.cwd(), "data/bookleaf.json");
    const dataset = JSON.parse(await readFile(filePath, "utf8")) as {
      authors: SampleAuthor[];
    };
    const books = dataset.authors.flatMap((author) => author.books);

    expect(dataset.authors).toHaveLength(10);
    expect(books).toHaveLength(18);
    expect(new Set(dataset.authors.map((author) => author.authorId)).size).toBe(10);
    expect(new Set(dataset.authors.map((author) => author.email)).size).toBe(10);
    expect(new Set(books.map((book) => book.bookId)).size).toBe(18);

    for (const author of dataset.authors) {
      expect(author.name.trim()).not.toBe("");
      expect(author.email).toMatch(/@example\.test$/);
      for (const book of author.books) {
        expect(book.title.trim()).not.toBe("");
        expect(book.status.trim()).not.toBe("");
      }
    }
  });
});
