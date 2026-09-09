import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/client";

/**
 * UX convenience only, not a security boundary — the Edge runtime has no way
 * to verify the JWT (no signing secret available here), so this is purely a
 * presence check on the `accessToken` cookie. The backend's `requireAuth`/
 * `requireAdmin` middleware is what actually protects the data; every admin
 * API call is re-validated there regardless of what happens here.
 *
 * Named `proxy.ts` (not `middleware.ts`) per the Next.js 16 file convention
 * rename — `middleware.ts` still works but is deprecated as of Next 16.
 *
 * If the access token is gone but the refresh token is still present, this
 * proactively exchanges it via the backend's `/api/user/refresh` before
 * deciding whether to redirect.
 *
 * A `Set-Cookie` on the response alone only reaches the browser for its
 * *next* request — it does nothing for Server Components rendered later in
 * *this* request (e.g. `(dashboard)/layout.tsx`'s `getSession()`), since
 * `next/headers`'s `cookies()` reflects the original incoming request, not
 * the response being built. So on a successful refresh we also rewrite the
 * outgoing request's `Cookie` header (via `NextResponse.next({ request })`)
 * so downstream rendering sees the new access token immediately, in
 * addition to setting it on the response for the browser to persist.
 */
export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  let hasSession = request.cookies.has("accessToken");
  let refreshedCookies: string[] | undefined;
  let newAccessToken: string | undefined;

  if (!hasSession && !isLoginPage && request.cookies.has("refreshToken")) {
    try {
      const refreshRes = await fetch(`${getApiBaseUrl()}/api/user/refresh`, {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });

      if (refreshRes.ok) {
        refreshedCookies = refreshRes.headers.getSetCookie();
        newAccessToken = refreshedCookies
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split(";")[0]
          .slice("accessToken=".length);

        hasSession = Boolean(newAccessToken);
      }
    } catch {
      // Backend unreachable — fall through to the normal redirect below.
    }
  }

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  let response: NextResponse;

  if (newAccessToken) {
    const forwardedCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name !== "accessToken")
      .map((cookie) => `${cookie.name}=${cookie.value}`);
    forwardedCookies.push(`accessToken=${newAccessToken}`);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("cookie", forwardedCookies.join("; "));

    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    response = NextResponse.next();
  }

  refreshedCookies?.forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
