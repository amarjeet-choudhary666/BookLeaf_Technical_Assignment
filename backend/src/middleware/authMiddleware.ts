import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { getDb } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { ApiError } from "../utils/apiError.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ACCESS_TOKEN_COOKIE } from "../utils/authSession.ts";
import { verifyAccessToken } from "../utils/jwt.ts";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "author" | "admin";
  authorId: string | null;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export const requireAuth: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const bearerToken = req
      .get("authorization")
      ?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = bearerToken ?? req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token || typeof token !== "string") {
      throw new ApiError(401, "Authentication required.");
    }

    let payload: ReturnType<typeof verifyAccessToken>;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "string"
    ) {
      throw new ApiError(401, "Invalid access token.");
    }

    const [user] = await getDb()
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        authorId: users.authorId,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || !user.isActive || (user.role === "author" && !user.authorId)) {
      throw new ApiError(401, "User is not authorized.");
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      authorId: user.authorId,
    };

    next();
  },
);
