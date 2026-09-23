const DEFAULT_API_BASE_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

/**
 * Thrown for any non-2xx backend response. Only `status`/`message` are
 * surfaced — the backend's error envelope also includes `stackTrace`/`error`
 * which must never be rendered to the user.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * How long a server-rendered read may wait on the backend before it is given
 * up on. Node's `fetch` has no timeout of its own: a backend that accepts the
 * connection and then never answers (a sleeping instance waking up, a dropped
 * packet, a request hung on the database) leaves the render awaiting a promise
 * that never settles.
 *
 * That is fatal specifically at build time. Every route renders through the
 * root layout, which reads Navigation, so one unanswered request stalls the
 * whole page render — and `next build` gives a page only 60 seconds
 * (`staticPageGenerationTimeout`) before it restarts static generation for
 * that page, retries twice more, then fails the build. Capping the wait well
 * under that budget turns an indefinite hang into a prompt rejection, which
 * every public caller already handles by rendering its static fallback copy
 * (root CLAUDE.md rule 5).
 *
 * Override with `API_FETCH_TIMEOUT_MS` where the backend is known to be slow
 * to wake, but keep it comfortably below 60000 or the build is back to timing
 * out.
 */
const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 10_000;

/**
 * Build-time only. `next build` prerenders every static route in its own
 * render, so a backend that is simply not answering costs one full timeout
 * *per page* — with enough pages queued onto one worker that stacks back up
 * towards the 60s-per-page budget the timeout exists to stay under. The first
 * missed deadline trips this for the rest of the build process: each worker
 * waits once, and every page after it falls back to static copy immediately.
 *
 * Deliberately never armed at runtime — a long-lived server has to keep
 * trying a backend that may well recover between two requests.
 */
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build";

let backendTimedOutDuringBuild = false;

function timeoutError(timeoutMs: number): ApiError {
  return new ApiError(504, `The server did not respond within ${timeoutMs}ms.`);
}

function getServerFetchTimeoutMs(): number {
  const configured = Number(process.env.API_FETCH_TIMEOUT_MS);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_SERVER_FETCH_TIMEOUT_MS;
}

/**
 * Runs the request under an abort deadline and reports a breach as an
 * ordinary `ApiError`, so callers keep the single error type they already
 * branch on instead of having to recognise a bare `TimeoutError`. A caller
 * that brought its own `signal` keeps it — its deadline wins over this one.
 *
 * Next strips the signal from its own background revalidation of a cached
 * fetch, so this does not interfere with `next: { revalidate }` caching.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  if (init.signal) return fetch(url, init);

  const timeoutMs = getServerFetchTimeoutMs();

  if (backendTimedOutDuringBuild) throw timeoutError(timeoutMs);

  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      if (IS_BUILD_PHASE) backendTimedOutDuringBuild = true;

      throw timeoutError(timeoutMs);
    }

    throw error;
  }
}

type ApiEnvelope<T> = {
  message: string;
  data?: T;
};

async function parseBody(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await parseBody(res);

  if (!res.ok) {
    const message =
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : res.statusText || "Request failed";

    throw new ApiError(res.status, message);
  }

  return (body as ApiEnvelope<T>).data as T;
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = {};

  // Let the browser set the multipart boundary itself for FormData bodies.
  if (!isFormData && init?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return { ...headers, ...(init?.headers as Record<string, string> | undefined) };
}

// Never worth retrying-after-refresh: login has no session yet, and refresh
// retrying itself would recurse.
const REFRESH_EXEMPT_PATHS = new Set(["/api/user/login", "/api/user/refresh"]);

/**
 * For Client Components. Deliberately calls `path` as a same-origin relative
 * URL (proxied to the backend by the `/api/:path*` rewrite in
 * `next.config.ts`) rather than `getApiBaseUrl()` directly. The backend
 * lives on a different origin in production, and a cookie that origin sets
 * is only ever sent back to *that* origin — `SameSite=None` makes it a valid
 * cross-site cookie for direct backend calls, but it would never reach the
 * frontend's own domain, so `proxy.ts`'s cookie check and `next/headers`'s
 * `cookies()` would never see it. Routing through the frontend's own origin
 * makes the auth cookies first-party to this app.
 *
 * Relies on the browser automatically sending the httpOnly session cookies
 * via `credentials: "include"`.
 *
 * On a 401 from any other path, silently attempts one refresh (via the
 * httpOnly `refreshToken` cookie) and retries the request once before
 * surfacing the error — covers an access token expiring mid-session during
 * an interactive admin action.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: buildHeaders(init),
  });

  if (res.status === 401 && !REFRESH_EXEMPT_PATHS.has(path)) {
    const { refreshSession } = await import("./auth");

    if (await refreshSession()) {
      const retryRes = await fetch(path, {
        ...init,
        credentials: "include",
        headers: buildHeaders(init),
      });

      return handleResponse<T>(retryRes);
    }
  }

  return handleResponse<T>(res);
}

/**
 * For Server Components. Next.js does NOT forward the incoming request's
 * cookies to outgoing `fetch` calls automatically, so the session cookies
 * are read via `next/headers` and forwarded manually as a `Cookie` header.
 *
 * `next/headers` is imported dynamically (not at module scope) so this file
 * stays safe to import from Client Components that only ever call
 * `apiFetch` — a top-level import would poison the whole module for the
 * client bundle.
 */
export async function serverApiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetchWithTimeout(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: init.cache ?? "no-store",
    headers: {
      ...buildHeaders(init),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  return handleResponse<T>(res);
}

/**
 * For Server Components fetching genuinely public, unauthenticated data
 * (no `requireAuth` on the backend route). Deliberately never touches
 * `next/headers`'s `cookies()` — that's a per-request dynamic API, and
 * calling it forces the whole route out of static/ISR rendering. A route
 * using `generateStaticParams`/`revalidate` (like `/work/[slug]`) throws
 * `DYNAMIC_SERVER_USAGE` at request time for any path rendered on-demand
 * (`dynamicParams: true`) the moment it calls `cookies()` — this avoids
 * that entirely for reads that never needed the session cookie anyway.
 *
 * No `cache`/`no-store` default here (unlike `serverApiFetch`, which must
 * always bypass caching for session-bound admin reads): leaving `init` as
 * given lets a page's own `export const revalidate` govern this fetch's
 * caching, which is what keeps `/work/[slug]` eligible for ISR instead of
 * falling back to fully dynamic per-request rendering.
 */
export async function serverPublicFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  return handleResponse<T>(res);
}
