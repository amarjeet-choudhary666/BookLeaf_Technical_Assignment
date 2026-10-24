import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .max(255, "Email must be 255 characters or fewer.")
  .email("Enter a valid email address.")
  .transform((email) => email.toLowerCase());

const loginPasswordSchema = z
  .string()
  .min(1, "Password is required.")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must be 72 UTF-8 bytes or fewer.",
  );

export const loginSchema = z
  .object({
    email: emailSchema,
    password: loginPasswordSchema,
  })
  .strict();

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(150, "Name must be 150 characters or fewer."),
    email: emailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password must be 72 UTF-8 bytes or fewer.",
      ),
    phone: z
      .string()
      .trim()
      .max(30, "Phone must be 30 characters or fewer.")
      .optional(),
    city: z
      .string()
      .trim()
      .max(100, "City must be 100 characters or fewer.")
      .optional(),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
