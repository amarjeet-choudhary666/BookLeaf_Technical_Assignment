import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/authController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";
import { validateBody } from "../middleware/validateBody.ts";
import {
  loginSchema,
  registerSchema,
} from "../validation/authValidation.ts";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;
