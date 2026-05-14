import axios, { type AxiosError } from "axios";

/**
 * Shared axios instance. baseURL is intentionally relative — Vite's
 * dev server proxies /api to localhost:5100, and in production the
 * Express server serves both the API and the SPA from the same origin.
 * This means we never need a build-time env switch for the API URL.
 *
 * withCredentials: true is required for the JWT cookie to round-trip
 * (both the HTTP API and the WebSocket auth depend on it).
 */
export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Best-effort error message extraction. Always returns a string suitable
 * for surfacing in a toast — never undefined.
 */
export const apiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ message?: string }>;
    return (
      ax.response?.data?.message ??
      ax.message ??
      "Something went wrong. Please try again."
    );
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};
