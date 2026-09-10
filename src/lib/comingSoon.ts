/**
 * This site ships the Home page only — every other destination the design
 * links to (Work, Services, Studio, articles, case studies…) isn't built
 * here. Those links point at `/coming-soon` instead of a dead `#` or a 404,
 * and `app/not-found.tsx` renders the same page for any URL that slips
 * through (e.g. a CMS-authored case-study href).
 *
 * `/` is the landing frame (`LandingSection` — the brand hero shell with the
 * launch statement) and is a different composition from this holding page;
 * the Home page it used to serve is still built and now lives at `HOME_HREF`.
 */
export const COMING_SOON_HREF = "/coming-soon";

/** Where the full Home page is served from while `/` holds the Coming Soon frame. */
export const HOME_HREF = "/home";

/**
 * The paths this site actually serves. Everything else in the navigation is
 * a real page of the *full* site (`/work-innovation`, `/about`, `/services`,
 * …) that simply doesn't exist here.
 */
const BUILT_ROUTES = new Set(["/", HOME_HREF, COMING_SOON_HREF]);

/**
 * Sends one CMS-authored navigation href to `/coming-soon` unless this site
 * can actually serve it.
 *
 * The navigation content lives in the shared CMS, which the full site reads
 * too — there, "Work & Innovation" really does go to `/work-innovation`. So
 * the redirect can't be made by editing that content: it belongs to this
 * app, which is the only one where those routes are missing. Navigation
 * logic is non-editable by design (see the root CLAUDE.md), so a link's
 * destination being unreachable *here* is this app's business, not an
 * admin's.
 *
 * Without it those links land on `not-found.tsx` — which renders the Coming
 * Soon page anyway, but under whatever URL was authored and with a 404
 * status. This makes the destination honest.
 *
 * Left alone: external destinations (`http(s):`, `mailto:`, `tel:`) and
 * in-page anchors (`#contact`), neither of which is ours to redirect.
 */
export function resolveNavHref(href: string | undefined): string {
  const value = (href ?? "").trim();
  if (value === "") return COMING_SOON_HREF;
  if (/^(?:https?:|mailto:|tel:)/i.test(value)) return value;
  if (value.startsWith("#")) return value;

  // Compare paths only: a query or hash doesn't change which route answers.
  const path = value.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return BUILT_ROUTES.has(path) ? value : COMING_SOON_HREF;
}

/** `resolveNavHref` over any list of nav items — links, dropdown cards. */
export function resolveNavHrefs<T extends { href: string }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, href: resolveNavHref(item.href) }));
}
