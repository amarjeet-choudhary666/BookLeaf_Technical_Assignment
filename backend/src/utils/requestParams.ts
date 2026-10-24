import type { Request } from "express";
import { ApiError } from "./apiError.ts";

export function getRouteParam(req: Request, name: string, maxLength = 255): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new ApiError(400, `Invalid ${name} route parameter.`);
  }
  return value;
}

export function getUuidParam(req: Request, name: string): string {
  const value = getRouteParam(req, name, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new ApiError(400, `Invalid ${name} route parameter.`);
  }
  return value;
}
