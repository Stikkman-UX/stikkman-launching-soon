import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AdminNavigationSectionDoc,
  NavigationPublicContent,
  NavigationSection,
  NavigationSectionSummary,
  NavigationSectionUpsertPayload,
} from "./types";

/**
 * How long a prerendered page may keep serving the navigation it was built
 * with. This has to be declared on the fetch itself, unlike every other
 * public read: those run from a page, which can state its own `revalidate`,
 * while this one runs from the root layout — and a layout has no say in the
 * caching of the static routes it wraps. Left uncached, the nav is simply
 * baked into `/` and `/coming-soon` at build time and an admin edit never
 * appears until the next deploy, which is exactly the bug this fixes.
 *
 * A minute is the trade: the header stays on Next's static/ISR path (no
 * per-request backend round trip, no dynamic rendering forced on every route
 * in the app) and an edit made in the panel shows up within one.
 */
const NAVIGATION_REVALIDATE_SECONDS = 60;

/**
 * Server-only, public: the whole Navigation document, every section
 * resolved. Used by both `layout.tsx` (top-bar nav + sectors dropdown +
 * menu overlay) and `Footer.tsx` (social links) — identical calls within
 * the same request are deduped by Next's built-in fetch memoization, since
 * both go through `serverPublicFetch` with the same URL/init.
 *
 * `serverPublicFetch`, not `serverApiFetch`: this is rendered from the root
 * layout, which wraps every route including the ISR-static `/work/[slug]`
 * and `/sectors/[slug]` — touching `next/headers`'s `cookies()` here would
 * force those pages into fully dynamic rendering.
 */
export async function getPublicNavigation(): Promise<NavigationPublicContent> {
  return serverPublicFetch<NavigationPublicContent>("/api/navigation/public", {
    next: { revalidate: NAVIGATION_REVALIDATE_SECONDS },
  });
}

/** Server-only, admin: the fixed 4-entry section summary for the hub page. */
export async function listNavigationSections(): Promise<
  NavigationSectionSummary[]
> {
  return serverApiFetch<NavigationSectionSummary[]>("/api/navigation/sections");
}

/**
 * Server-only, admin: a single section. Never 404s for an unseeded section —
 * the backend answers with its registry defaults and `exists: false`, same
 * discipline as `getSectorSectionForAdmin`.
 */
export async function getNavigationSectionForAdmin(
  section: NavigationSection
): Promise<AdminNavigationSectionDoc> {
  return serverApiFetch<AdminNavigationSectionDoc>(
    `/api/navigation/sections/${section}`
  );
}

/** Client-side twin of `getNavigationSectionForAdmin`, used to re-read after a reset. */
export async function fetchNavigationSectionForAdmin(
  section: NavigationSection
): Promise<AdminNavigationSectionDoc> {
  return apiFetch<AdminNavigationSectionDoc>(`/api/navigation/sections/${section}`);
}

/** Full replace, not a merge — same contract as `saveSectorSection`. */
export async function saveNavigationSection(
  section: NavigationSection,
  payload: NavigationSectionUpsertPayload
): Promise<AdminNavigationSectionDoc> {
  return apiFetch<AdminNavigationSectionDoc>(`/api/navigation/sections/${section}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Resets a section to the backend's registry defaults. */
export async function resetNavigationSection(
  section: NavigationSection
): Promise<void> {
  await apiFetch<undefined>(`/api/navigation/sections/${section}`, {
    method: "DELETE",
  });
}
