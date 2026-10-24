import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import type { RequestHandler, Response } from "express";
import { getDb } from "../db/index.ts";
import { authors, users } from "../db/schema.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_MS,
  accessTokenCookieOptions,
} from "../utils/authSession.ts";
import { generateAccessToken } from "../utils/jwt.ts";
import type {
  LoginInput,
  RegisterInput,
} from "../validation/authValidation.ts";

const BCRYPT_ROUNDS = 12;

function toPublicUser(user: {
  id: string;
  email: string;
  role: "author" | "admin";
  authorId: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    authorId: user.authorId,
  };
}

function setAuthCookie(res: Response, accessToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...accessTokenCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const input = req.body as RegisterInput;
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  let account:
    | {
        user: ReturnType<typeof toPublicUser>;
        accessToken: string;
      }
    | undefined;
  try {
    account = await getDb().transaction(async (tx) => {
      const [existingUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(sql`lower(${users.email}) = ${input.email}`)
        .limit(1);

      const [existingAuthor] = await tx
        .select({ authorId: authors.authorId })
        .from(authors)
        .where(sql`lower(${authors.email}) = ${input.email}`)
        .limit(1);

      if (existingUser || existingAuthor) {
        throw new ApiError(
          409,
          "This email cannot be used to create an account. Contact support.",
        );
      }

      // Do not let public registration claim an imported author profile just
      // by supplying its email. Existing profiles need a verified onboarding
      // or admin-provisioned account before they can be linked to a login.
      const authorId = randomBytes(10).toString("hex").toUpperCase();
      await tx.insert(authors).values({
        authorId,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        city: input.city || null,
        joinedDate: new Date().toISOString().slice(0, 10),
      });

      const [createdUser] = await tx
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          role: "author",
          authorId,
        })
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          authorId: users.authorId,
        });

      if (!createdUser) {
        throw new Error("Account registration did not return a user.");
      }
      return {
        user: createdUser,
        accessToken: generateAccessToken(createdUser.id),
      };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "This email cannot be used to create an account. Contact support.",
      );
    }
    throw error;
  }

  if (!account) {
    throw new Error("Account registration did not return a session.");
  }

  setAuthCookie(res, account.accessToken);
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: toPublicUser(account.user) },
        "Account created.",
      ),
    );
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;
  const [user] = await getDb()
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  const passwordMatches = user?.isActive
    ? await bcrypt.compare(password, user.passwordHash).catch(() => false)
    : false;

  if (!user || !user.isActive || !passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  setAuthCookie(res, generateAccessToken(user.id));

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: toPublicUser(user) }, "Login successful."),
    );
});

export const getCurrentUser: RequestHandler = (req, res) => {
  if (!req.authUser) {
    throw new ApiError(401, "Authentication required.");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: req.authUser }, "Current user retrieved."),
    );
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  res.clearCookie("refreshToken", accessTokenCookieOptions);
  res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully."));
};
