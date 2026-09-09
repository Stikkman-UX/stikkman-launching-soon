import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AboutUsSection,
  AboutUsSectionUpsertPayload,
  AdminAboutUsSectionDoc,
  AboutUsSectionSummary,
  PublicAboutUs,
} from "./types";

/**
 * Server-only, public: the whole About Us document, every section resolved.
 *
 * Deliberately swallows any failure and returns `{sections: {}}` instead of
 * throwing, unlike `getPublicNavigation` — Navigation has a full static
 * fallback for every field it renders, but About Us is a brand-new page with
 * no prior static content to fall back to, so a fetch failure must not break
 * the public page/build (Rule 5: gracefully handle missing content).
 */
export async function getPublicAboutUs(): Promise<PublicAboutUs> {
  try {
    return await serverPublicFetch<PublicAboutUs>("/api/about-us/public");
  } catch {
    return { sections: {} };
  }
}

/** Server-only, admin: the fixed 7-entry section summary for the hub page. */
export async function listAboutUsSections(): Promise<AboutUsSectionSummary[]> {
  return serverApiFetch<AboutUsSectionSummary[]>("/api/about-us/sections");
}

/**
 * Server-only, admin: a single section. Never 404s for an unseeded section —
 * the backend answers with its registry defaults and `exists: false`, same
 * discipline as `getNavigationSectionForAdmin`.
 */
export async function getAboutUsSectionForAdmin(
  section: AboutUsSection
): Promise<AdminAboutUsSectionDoc> {
  return serverApiFetch<AdminAboutUsSectionDoc>(
    `/api/about-us/sections/${section}`
  );
}

/** Client-side twin of `getAboutUsSectionForAdmin`, used to re-read after a reset. */
export async function fetchAboutUsSectionForAdmin(
  section: AboutUsSection
): Promise<AdminAboutUsSectionDoc> {
  return apiFetch<AdminAboutUsSectionDoc>(`/api/about-us/sections/${section}`);
}

/** Full replace, not a merge — same contract as `saveNavigationSection`. */
export async function saveAboutUsSection(
  section: AboutUsSection,
  payload: AboutUsSectionUpsertPayload
): Promise<AdminAboutUsSectionDoc> {
  return apiFetch<AdminAboutUsSectionDoc>(`/api/about-us/sections/${section}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Resets a section to the backend's registry defaults. */
export async function resetAboutUsSection(section: AboutUsSection): Promise<void> {
  await apiFetch<undefined>(`/api/about-us/sections/${section}`, {
    method: "DELETE",
  });
}

// NOTE: the public frontend route is `/about` while every API call above
// targets `/api/about-us` (matching the backend resource name). This
// asymmetry is intentional — not a bug, don't "fix" the prefix to match the
// route later.
