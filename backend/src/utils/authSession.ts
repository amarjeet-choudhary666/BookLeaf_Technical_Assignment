import dotenv from "dotenv";

dotenv.config();

export const ACCESS_TOKEN_COOKIE = "accessToken";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function tokenLifetimeMs(value: string | undefined): number {
  const match = value?.trim().match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return 15 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase();
  const multiplier =
    unit === "s" ? 1000 :
      unit === "m" ? 60 * 1000 :
        unit === "h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return amount * multiplier;
}

export const ACCESS_TOKEN_MAX_AGE_MS = tokenLifetimeMs(process.env.JWT_EXPIRES_IN);
