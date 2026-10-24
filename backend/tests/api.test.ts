import request from "supertest";
import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public API and unauthenticated access", () => {
  it("returns a healthy response", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok" },
      message: "Service is healthy.",
    });
  });

  it("serves the OpenAPI UI", async () => {
    const response = await request(app).get("/api/docs/").expect(200);
    expect(response.text).toContain("swagger");
  });

  it("rejects requests to protected author and admin endpoints before database access", async () => {
    const [authorResponse, adminResponse] = await Promise.all([
      request(app).get("/api/authors/me").expect(401),
      request(app).get("/api/admin/dashboard").expect(401),
    ]);
    expect(authorResponse.body.error.code).toBe("UNAUTHENTICATED");
    expect(adminResponse.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("validates login input and returns the standard error envelope", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "" })
      .expect(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.message).toBe("Request validation failed.");
    expect(response.body).not.toHaveProperty("data");
  });

  it("rejects expired JWTs before looking up an account", async () => {
    const secret = "test-only-secret-with-more-than-32-characters";
    vi.stubEnv("ACCESS_TOKEN_SECRET", secret);
    const expiredToken = jwt.sign({ userId: "00000000-0000-4000-8000-000000000001" }, secret, {
      expiresIn: -1,
    });
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
    expect(response.body.error.message).toBe("Invalid or expired access token.");
  });
});
