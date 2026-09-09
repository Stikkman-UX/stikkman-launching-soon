import { apiFetch, serverApiFetch } from "./client";
import type { AdminUser } from "./types";

/** Client-side: logs in and lets the backend set the httpOnly session cookies. */
export async function login(email: string, password: string): Promise<void> {
  await apiFetch<undefined>("/api/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Client-side: clears the session cookies. */
export async function logout(): Promise<void> {
  await apiFetch<undefined>("/api/user/logout", { method: "POST" });
}

/**
 * Client-side: exchanges the httpOnly refresh-token cookie for a new
 * access-token cookie. Resolves to success/failure rather than throwing so
 * `apiFetch`'s retry-on-401 wrapper doesn't need a try/catch.
 */
export async function refreshSession(): Promise<boolean> {
  try {
    await apiFetch<undefined>("/api/user/refresh", { method: "POST" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Server-only: resolves the current admin session by forwarding the
 * request's cookies to `GET /api/user/me`. Returns `null` on any failure
 * (no session, expired token, backend unreachable) rather than throwing —
 * callers should treat `null` as "not authenticated".
 */
export async function getSession(): Promise<AdminUser | null> {
  try {
    return await serverApiFetch<AdminUser>("/api/user/me");
  } catch {
    return null;
  }
}
