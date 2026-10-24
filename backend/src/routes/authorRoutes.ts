import { Router } from "express";
import {
  getMyAuthorProfile,
  getMyDashboard,
} from "../controllers/authorController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";
import { requireAuthor } from "../middleware/authorization.ts";

const router = Router();

router.use(requireAuth, requireAuthor);
router.get("/me/dashboard", getMyDashboard);
router.get("/me", getMyAuthorProfile);

export default router;
