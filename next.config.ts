import type { NextConfig } from "next";

// This app ships the admin panel too, and its Client Components call the CMS
// through same-origin `/api/*` paths (see `lib/api/client.ts`). Without this
// rewrite those requests hit Next itself and 404 — login and every admin save
// included. Proxying through the frontend's own domain (instead of the browser
// calling the backend origin directly) is also what makes the auth cookies the
// backend sets first-party to this domain: a cross-site `SameSite=None` cookie
// is only ever sent back to the backend origin, never to the frontend origin
// issuing the requests, so `proxy.ts` and `next/headers`'s `cookies()` would
// otherwise never see a session.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
