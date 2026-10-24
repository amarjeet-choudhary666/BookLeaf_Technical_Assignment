import api, { type ApiEnvelope } from "@/lib/api";
import type { User } from "@/types";

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<ApiEnvelope<{ user: User }>>("/auth/login", {
    email,
    password,
  });
  return data.data.user;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}): Promise<User> {
  const { data } = await api.post<ApiEnvelope<{ user: User }>>(
    "/auth/register",
    input,
  );
  return data.data.user;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<ApiEnvelope<{ user: User }>>("/auth/me");
  return data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
