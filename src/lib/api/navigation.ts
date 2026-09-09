import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AdminNavigationSectionDoc,
  NavigationPublicContent,
  NavigationSection,
  NavigationSectionSummary,
  NavigationSectionUpsertPayload,
} from "./types";

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
  return serverPublicFetch<NavigationPublicContent>("/api/navigation/public");
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
