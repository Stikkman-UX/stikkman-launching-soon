import type { NextConfig } from "next";

// Deliberately bare. The main site (`stikkman-revamp`) proxies `/api/*` to the
// CMS backend so auth cookies stay first-party; this app has no backend, no
// CMS and no authenticated routes — every string it renders is static.
const nextConfig: NextConfig = {};

export default nextConfig;
