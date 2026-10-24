class ApiError extends Error {
  statusCode: number;
  code: string;
  errors: unknown[];

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code =
      code ??
      ({
        400: "VALIDATION_ERROR",
        401: "UNAUTHENTICATED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        429: "RATE_LIMITED",
      }[statusCode] ??
        "INTERNAL_ERROR");
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
