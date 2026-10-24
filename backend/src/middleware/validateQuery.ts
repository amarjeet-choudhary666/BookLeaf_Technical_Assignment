import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/apiError.ts";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
    }
  }
}

export function validateQuery(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new ApiError(
          400,
          "Request validation failed.",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        ),
      );
      return;
    }
    req.validatedQuery = result.data;
    next();
  };
}
