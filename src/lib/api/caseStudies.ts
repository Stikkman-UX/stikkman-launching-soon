import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AdminCaseStudy,
  AdminCaseStudySectionDoc,
  CaseStudySection,
  CaseStudySectionSummary,
  CaseStudySectionUpsertPayload,
  PublicCaseStudy,
  PublicCaseStudySummary,
  RawAdminCaseStudy,
  UpdateCaseStudyPayload,
} from "./types";

function normalizeAdminCaseStudy(raw: RawAdminCaseStudy): AdminCaseStudy {
  const { id, _id, ...rest } = raw;
  return { ...rest, id: id ?? _id ?? "" };
}

/**
 * Server-only, public: published case studies sorted by order. Powers both
 * `generateStaticParams()` for `/work/[slug]` at build time and any future
 * `/work` index — hero thumbnails are already resolved (image or video).
 */
export async function getPublicCaseStudies(): Promise<PublicCaseStudySummary[]> {
  return serverPublicFetch<PublicCaseStudySummary[]>("/api/case-studies/public");
}

/**
 * Server-only, public: full detail for one case study. 404s (via `ApiError`)
 * if missing or unpublished — callers translate that into `notFound()`.
 */
export async function getPublicCaseStudy(slug: string): Promise<PublicCaseStudy> {
  return serverPublicFetch<PublicCaseStudy>(`/api/case-studies/public/${slug}`);
}

/** Server-only, admin: every case study, including unpublished. */
export async function listAdminCaseStudies(): Promise<AdminCaseStudy[]> {
  const data = await serverApiFetch<RawAdminCaseStudy[]>("/api/case-studies");
  return data.map(normalizeAdminCaseStudy);
}

/** Server-only, admin: a single case study's identity/publish state. */
export async function getAdminCaseStudy(id: string): Promise<AdminCaseStudy> {
  const data = await serverApiFetch<RawAdminCaseStudy>(`/api/case-studies/${id}`);
  return normalizeAdminCaseStudy(data);
}

/**
 * Title-only create — unlike `createProject`, a case study starts with just a
 * title and gets its sections filled in afterwards across the hub. Routes the
 * admin straight into `/admin/case-studies/[id]` on success.
 */
export async function createCaseStudy(payload: {
  title: string;
}): Promise<AdminCaseStudy> {
  const data = await apiFetch<RawAdminCaseStudy>("/api/case-studies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeAdminCaseStudy(data);
}

/** Title/publish state only — slug and order are never accepted here. */
export async function updateCaseStudy(
  id: string,
  payload: UpdateCaseStudyPayload
): Promise<AdminCaseStudy> {
  const data = await apiFetch<RawAdminCaseStudy>(`/api/case-studies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeAdminCaseStudy(data);
}

export async function deleteCaseStudy(id: string): Promise<void> {
  await apiFetch<RawAdminCaseStudy>(`/api/case-studies/${id}`, {
    method: "DELETE",
  });
}

/**
 * Reorders the whole board in one shot. `orderedIds` must be the exact full
 * set of case study ids — the backend 400s on a partial list — so callers
 * submit the entire locally-held list, not a diff (mirrors `reorderProjects`).
 */
export async function reorderCaseStudies(orderedIds: string[]): Promise<void> {
  await apiFetch<undefined>("/api/case-studies/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}

/** Server-only, admin: the fixed 6-entry section summary for the hub page. */
export async function listCaseStudySections(
  id: string
): Promise<CaseStudySectionSummary[]> {
  return serverApiFetch<CaseStudySectionSummary[]>(
    `/api/case-studies/${id}/sections`
  );
}

/**
 * Server-only, admin: a single section. Never 404s for an unseeded section —
 * the backend answers with its registry defaults and `exists: false`, same
 * discipline as `getSectionForAdmin`.
 */
export async function getCaseStudySectionForAdmin(
  id: string,
  section: CaseStudySection
): Promise<AdminCaseStudySectionDoc> {
  return serverApiFetch<AdminCaseStudySectionDoc>(
    `/api/case-studies/${id}/sections/${section}`
  );
}

/** Client-side twin of `getCaseStudySectionForAdmin`, used to re-read after a reset. */
export async function fetchCaseStudySectionForAdmin(
  id: string,
  section: CaseStudySection
): Promise<AdminCaseStudySectionDoc> {
  return apiFetch<AdminCaseStudySectionDoc>(
    `/api/case-studies/${id}/sections/${section}`
  );
}

/**
 * Full replace, not a merge — same contract as `savePageSection`. May 422
 * (`ValidationFailed`) for the Gallery section if a submitted image asset
 * isn't actually an image.
 */
export async function saveCaseStudySection(
  id: string,
  section: CaseStudySection,
  payload: CaseStudySectionUpsertPayload
): Promise<AdminCaseStudySectionDoc> {
  return apiFetch<AdminCaseStudySectionDoc>(
    `/api/case-studies/${id}/sections/${section}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

/** Resets a section to the backend's registry defaults. */
export async function resetCaseStudySection(
  id: string,
  section: CaseStudySection
): Promise<void> {
  await apiFetch<undefined>(`/api/case-studies/${id}/sections/${section}`, {
    method: "DELETE",
  });
}
