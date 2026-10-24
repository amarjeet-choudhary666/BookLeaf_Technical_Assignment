const success = {
  type: "object",
  properties: {
    success: { type: "boolean", enum: [true] },
    data: {},
    message: { type: "string" },
  },
  required: ["success", "data", "message"],
};

const error = {
  description: "Standard error response.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [false] },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
            required: ["code", "message"],
          },
        },
        required: ["success", "error"],
      },
    },
  },
};

const secured = [{ cookieAuth: [] }, { bearerAuth: [] }];
const protectedErrors = {
  400: error,
  401: error,
  403: error,
  404: error,
  409: error,
  429: error,
  413: error,
  500: error,
};
const response = {
  200: { description: "Successful response.", content: { "application/json": { schema: success } } },
  201: { description: "Resource created.", content: { "application/json": { schema: success } } },
  ...protectedErrors,
};

const pageParameters = [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  { name: "sort", in: "query", schema: { type: "string", enum: ["createdAt", "updatedAt", "priority"] } },
  { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
];
const simplePageParameters = pageParameters.slice(0, 2);
const pathTicket = {
  name: "ticketId",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "BookLeaf Author Support API",
    version: "1.0.0",
    description:
      "Author support and communication portal. Admin-only internal notes are intentionally separate from public ticket replies.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Health" },
    { name: "Authentication" },
    { name: "Authors" },
    { name: "Books" },
    { name: "Tickets" },
    { name: "Admin" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { 200: response[200], 500: error },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register an author account (never creates admins)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", maxLength: 150 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8, maxLength: 72 },
                  phone: { type: "string", maxLength: 30 },
                  city: { type: "string", maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { 201: response[201], 400: error, 409: error, 500: error },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in and set the HttpOnly access-token cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", maxLength: 72 },
                },
              },
            },
          },
        },
        responses: { 200: response[200], 400: error, 401: error, 429: error },
      },
    },
    "/api/auth/logout": {
      post: { tags: ["Authentication"], summary: "Clear the auth cookie", responses: { 200: response[200] } },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        security: secured,
        summary: "Get the current user without password data",
        responses: { 200: response[200], 401: error },
      },
    },
    "/api/authors/me": {
      get: { tags: ["Authors"], security: secured, summary: "Get the signed-in author's profile", responses: response },
    },
    "/api/authors/me/dashboard": {
      get: { tags: ["Authors"], security: secured, summary: "Get author book and ticket counts", responses: response },
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        security: secured,
        summary: "List only the signed-in author's books",
        parameters: [...simplePageParameters, { name: "q", in: "query", schema: { type: "string" } }],
        responses: response,
      },
    },
    "/api/books/{bookId}": {
      get: {
        tags: ["Books"],
        security: secured,
        summary: "Get an owned book",
        parameters: [{ name: "bookId", in: "path", required: true, schema: { type: "string" } }],
        responses: response,
      },
    },
    "/api/tickets": {
      get: {
        tags: ["Tickets"],
        security: secured,
        summary: "List the author's tickets with filters and pagination",
        parameters: [
          ...pageParameters,
          { name: "status", in: "query", schema: { type: "string", enum: ["open", "in_progress", "resolved", "closed"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "priority", in: "query", schema: { type: "string", enum: ["critical", "high", "medium", "low"] } },
        ],
        responses: response,
      },
      post: {
        tags: ["Tickets"],
        security: secured,
        summary: "Create an account-level or book-linked ticket",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["subject", "description"],
                properties: {
                  bookId: { type: "string", nullable: true },
                  subject: { type: "string", minLength: 3, maxLength: 255 },
                  description: { type: "string", minLength: 10, maxLength: 10000 },
                },
              },
            },
          },
        },
        responses: { ...response, 201: response[201] },
      },
    },
    "/api/tickets/{ticketId}": {
      get: { tags: ["Tickets"], security: secured, summary: "Get an owned ticket", parameters: [pathTicket], responses: response },
    },
    "/api/tickets/{ticketId}/replies": {
      get: { tags: ["Tickets"], security: secured, summary: "List public replies only", parameters: [pathTicket], responses: response },
    },
    "/api/admin/dashboard": {
      get: { tags: ["Admin"], security: secured, summary: "Admin dashboard counts", responses: response },
    },
    "/api/admin/authors": {
      get: { tags: ["Admin"], security: secured, summary: "Search and page authors", parameters: [...simplePageParameters, { name: "q", in: "query", schema: { type: "string" } }], responses: response },
    },
    "/api/admin/authors/{authorId}": {
      get: { tags: ["Admin"], security: secured, summary: "Get an author, books, and tickets", parameters: [{ name: "authorId", in: "path", required: true, schema: { type: "string" } }], responses: response },
    },
    "/api/admin/books": {
      get: { tags: ["Admin"], security: secured, summary: "List books", parameters: [...simplePageParameters, { name: "q", in: "query", schema: { type: "string" } }, { name: "authorId", in: "query", schema: { type: "string" } }], responses: response },
    },
    "/api/admin/tickets": {
      get: {
        tags: ["Admin"],
        security: secured,
        summary: "Filter and page tickets",
        parameters: [
          ...pageParameters,
          { name: "status", in: "query", schema: { type: "string", enum: ["open", "in_progress", "resolved", "closed"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "priority", in: "query", schema: { type: "string", enum: ["critical", "high", "medium", "low"] } },
          { name: "assignedTo", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "authorId", in: "query", schema: { type: "string" } },
          { name: "dateFrom", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "dateTo", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: response,
      },
    },
    "/api/admin/tickets/{ticketId}": {
      get: { tags: ["Admin"], security: secured, summary: "Get ticket, author, book, and public replies", parameters: [pathTicket], responses: response },
      patch: {
        tags: ["Admin"],
        security: secured,
        summary: "Update ticket state, category, priority, or assignee",
        parameters: [pathTicket],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["open", "in_progress", "resolved", "closed"] },
                  category: { type: "string", enum: ["royalty_payments", "isbn_metadata", "printing_quality", "distribution_availability", "book_status_production", "general_inquiry"] },
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  assignedTo: { type: "string", format: "uuid", nullable: true },
                },
              },
            },
          },
        },
        responses: response,
      },
    },
    "/api/admin/tickets/{ticketId}/assign": {
      post: {
        tags: ["Admin"],
        security: secured,
        summary: "Assign or unassign an active admin",
        parameters: [pathTicket],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["adminId"],
                properties: {
                  adminId: { type: "string", format: "uuid", nullable: true },
                },
              },
            },
          },
        },
        responses: response,
      },
    },
    "/api/admin/tickets/{ticketId}/classify": {
      post: { tags: ["Admin"], security: secured, summary: "Generate and persist an AI classification suggestion", parameters: [pathTicket], responses: { ...response, 429: error, 503: error } },
    },
    "/api/admin/tickets/{ticketId}/draft": {
      post: { tags: ["Admin"], security: secured, summary: "Generate and save a draft for admin review; does not send it", parameters: [pathTicket], responses: { ...response, 429: error, 503: error } },
    },
    "/api/admin/tickets/{ticketId}/replies": {
      post: {
        tags: ["Admin"],
        security: secured,
        summary: "Send a persisted public reply",
        parameters: [pathTicket],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: { message: { type: "string", maxLength: 10000 } },
              },
            },
          },
        },
        responses: { ...response, 201: response[201] },
      },
    },
    "/api/admin/tickets/{ticketId}/notes": {
      get: { tags: ["Admin"], security: secured, summary: "List private admin-only notes", parameters: [pathTicket], responses: response },
      post: {
        tags: ["Admin"],
        security: secured,
        summary: "Create a private admin-only note (not emitted to sockets)",
        parameters: [pathTicket],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["note"],
                properties: { note: { type: "string", maxLength: 10000 } },
              },
            },
          },
        },
        responses: { ...response, 201: response[201] },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "accessToken" },
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};
