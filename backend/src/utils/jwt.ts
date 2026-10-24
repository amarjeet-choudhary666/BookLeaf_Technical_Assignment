import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function getAccessTokenSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET or JWT_SECRET is not configured.");
  }
  return secret;
}

function getRefreshTokenSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured.");
  }
  return secret;
}

export const generateAccessToken = (userId: string): string =>
  jwt.sign(
    { userId },
    getAccessTokenSecret(),
    { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] },
  );

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, getRefreshTokenSecret(), { expiresIn: "7d" });

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, getAccessTokenSecret());
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, getRefreshTokenSecret());
};
