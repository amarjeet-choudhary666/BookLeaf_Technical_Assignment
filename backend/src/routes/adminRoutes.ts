import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  assignAdminTicket,
  classifyAdminTicket,
  createAdminNote,
  draftAdminTicketResponse,
  getAdminDashboard,
  getAdminTicket,
  getAuthorDetails,
  listAdminBooks,
  listAdminNotes,
  listAdminTickets,
  listAuthors,
  patchAdminTicket,
  postAdminReply,
} from "../controllers/adminController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";
import { requireAdmin } from "../middleware/authorization.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { validateQuery } from "../middleware/validateQuery.ts";
import {
  adminTicketQuerySchema,
  assignTicketSchema,
  internalNoteSchema,
  listQuerySchema,
  patchTicketSchema,
  replySchema,
} from "../validation/ticketValidation.ts";

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: { code: "RATE_LIMITED", message: "AI assistance limit reached. Try again later." },
    });
  },
});

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/authors", validateQuery(listQuerySchema), listAuthors);
router.get("/authors/:authorId", getAuthorDetails);
router.get("/books", validateQuery(listQuerySchema), listAdminBooks);
router.get("/tickets", validateQuery(adminTicketQuerySchema), listAdminTickets);
router.get("/tickets/:ticketId/notes", listAdminNotes);
router.post(
  "/tickets/:ticketId/notes",
  validateBody(internalNoteSchema),
  createAdminNote,
);
router.post(
  "/tickets/:ticketId/classify",
  aiLimiter,
  classifyAdminTicket,
);
router.post(
  "/tickets/:ticketId/draft",
  aiLimiter,
  draftAdminTicketResponse,
);
router.post(
  "/tickets/:ticketId/assign",
  validateBody(assignTicketSchema),
  assignAdminTicket,
);
router.post(
  "/tickets/:ticketId/replies",
  validateBody(replySchema),
  postAdminReply,
);
router.patch(
  "/tickets/:ticketId",
  validateBody(patchTicketSchema),
  patchAdminTicket,
);
router.get("/tickets/:ticketId", getAdminTicket);

export default router;
