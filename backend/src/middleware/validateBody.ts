import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/apiError.ts";

export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(new ApiError(400, "Request validation failed.", errors));
      return;
    }

    req.body = result.data;
    next();
  };
}
