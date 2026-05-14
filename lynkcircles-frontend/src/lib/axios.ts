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
/**
 * No default Content-Type: axios sets `application/json` automatically
 * when the request body is a plain object, AND `multipart/form-data`
 * with the correct boundary when the body is a FormData. Pinning
 * `application/json` here would have hidden that auto-detect and broken
 * file uploads to /messages/upload (multer never sees a multipart body
 * if the header is application/json).
 */
export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
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
