import { apiFetch, serverApiFetch } from "./client";
import type {
  AdminSectionDoc,
  AdminSectionSummary,
  HomePageContent,
  SectionUpsertPayload,
} from "./types";

/**
 * Server-only: powers a page's public read (Home, Work & Innovation). Only
 * published sections come back, and asset ids are already resolved to URLs
 * by the backend. Callers (`src/app/page.tsx`, `work-innovation/page.tsx`)
 * are responsible for falling back to their own static copy per-section if a
 * key is absent or this throws. Defaults to `HomePageContent` so every
 * existing call site stays unchanged; pass the type param for other pages.
 */
export async function getPageContent<T = HomePageContent>(
  page: string
): Promise<T> {
  const data = await serverApiFetch<{
    page: string;
    sections: T;
  }>(`/api/pages/${page}`);

  return data.sections ?? ({} as T);
}

/** Server-only, admin: every section of a page with its seed/publish state. */
export async function listPageSections(
  page: string
): Promise<AdminSectionSummary[]> {
  return serverApiFetch<AdminSectionSummary[]>(`/api/pages/${page}/sections`);
}

/**
 * Server-only, admin: a single section. An unseeded section resolves to the
 * backend's registry defaults with `exists: false` rather than a 404, so the
 * editor always opens pre-filled with today's live copy.
 */
export async function getSectionForAdmin(
  page: string,
  section: string
): Promise<AdminSectionDoc> {
  return serverApiFetch<AdminSectionDoc>(`/api/pages/${page}/${section}`);
}

/**
 * Client-side twin of `getSectionForAdmin`. `DELETE` reports only what it
 * removed, so the editor re-reads the section after a reset to pick up the
 * registry defaults it fell back to.
 */
export async function fetchSectionForAdmin(
  page: string,
  section: string
): Promise<AdminSectionDoc> {
  return apiFetch<AdminSectionDoc>(`/api/pages/${page}/${section}`);
}

/**
 * Full replace, not a merge — the editor always submits complete content, and
 * a deep merge would make removing a repeated item impossible.
 */
export async function savePageSection(
  page: string,
  section: string,
  payload: SectionUpsertPayload
): Promise<AdminSectionDoc> {
  return apiFetch<AdminSectionDoc>(`/api/pages/${page}/${section}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Resets a section to the backend's registry defaults. */
export async function resetPageSection(
  page: string,
  section: string
): Promise<void> {
  await apiFetch<undefined>(`/api/pages/${page}/${section}`, {
    method: "DELETE",
  });
}
