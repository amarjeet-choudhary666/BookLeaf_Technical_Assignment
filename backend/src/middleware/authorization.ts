import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiError.ts";

export const requireRole = (...roles: Array<"author" | "admin">): RequestHandler => {
  return (req, _res, next) => {
    if (!req.authUser) {
      next(new ApiError(401, "Authentication required."));
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      next(new ApiError(403, "You do not have permission to access this resource."));
      return;
    }
    next();
  };
};

export const requireAuthor = requireRole("author");
export const requireAdmin = requireRole("admin");
