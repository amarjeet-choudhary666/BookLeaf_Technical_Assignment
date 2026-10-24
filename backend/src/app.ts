import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.ts";
import authorRoutes from "./routes/authorRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import { authorTicketRouter, bookRouter } from "./routes/ticketRoutes.ts";
import { ApiError } from "./utils/apiError.ts";
import { openApiDocument } from "./utils/openApi.ts";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));
if (process.env.NODE_ENV !== "production") allowedOrigins.push("http://localhost:5173");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, "This origin is not allowed.", [], "FORBIDDEN"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many login attempts. Try again later." },
    });
  },
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "ok" },
    message: "Service is healthy.",
  });
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRouter);
app.use("/api/tickets", authorTicketRouter);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." },
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      error.type === "entity.too.large"
    ) {
      res.status(413).json({
        success: false,
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds the allowed size." },
      });
      return;
    }

    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
        });
        return;
    }

    if (error instanceof SyntaxError && "body" in error) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Malformed JSON request body." },
      });
      return;
    }

    console.error("Unhandled request error:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error." },
    });
});

export { app };
