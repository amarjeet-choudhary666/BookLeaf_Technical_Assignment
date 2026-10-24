import axios, { AxiosError, type AxiosInstance } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export type Paginated<T> = import("@/types").Paginated<T>;

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
}

export interface NormalizedApiError {
  status: number;
  code: string;
  message: string;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const normalized: NormalizedApiError = {
      status: error.response?.status ?? 0,
      code: error.response?.data?.error?.code ?? "NETWORK_ERROR",
      message:
        error.response?.data?.error?.message ??
        (error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Unable to reach the server. Check your connection."),
    };

    if (normalized.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(normalized);
  },
);

export default api;
