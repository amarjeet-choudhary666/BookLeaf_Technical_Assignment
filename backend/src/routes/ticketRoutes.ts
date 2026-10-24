import { Router } from "express";
import {
  getMyBooks,
  getMyBook,
} from "../controllers/authorController.ts";
import {
  createTicket,
  getMyTicket,
  getMyTicketReplies,
  listMyTickets,
} from "../controllers/ticketController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";
import { requireAuthor } from "../middleware/authorization.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { validateQuery } from "../middleware/validateQuery.ts";
import {
  authorTicketQuerySchema,
  createTicketSchema,
  listQuerySchema,
} from "../validation/ticketValidation.ts";

export const bookRouter = Router();
bookRouter.use(requireAuth, requireAuthor);
bookRouter.get("/", validateQuery(listQuerySchema), getMyBooks);
bookRouter.get("/:bookId", getMyBook);

export const authorTicketRouter = Router();
authorTicketRouter.use(requireAuth, requireAuthor);
authorTicketRouter.get("/", validateQuery(authorTicketQuerySchema), listMyTickets);
authorTicketRouter.post("/", validateBody(createTicketSchema), createTicket);
authorTicketRouter.get("/:ticketId/replies", getMyTicketReplies);
authorTicketRouter.get("/:ticketId", getMyTicket);

