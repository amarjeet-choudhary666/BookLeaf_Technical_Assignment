import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => /^postgres(?:ql)?:\/\//i.test(value), "Must be a PostgreSQL connection URL."),
  ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().regex(/^[1-9]\d*[smhd]$/i).default("15m"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  CLIENT_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(): Environment {
  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  if (!parsed.data.ACCESS_TOKEN_SECRET && !parsed.data.JWT_SECRET) {
    throw new Error("Invalid environment configuration: ACCESS_TOKEN_SECRET or JWT_SECRET is required.");
  }
  return parsed.data;
}
