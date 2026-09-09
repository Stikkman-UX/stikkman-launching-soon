import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AdminSector,
  AdminSectorSectionDoc,
  CreateSectorPayload,
  PublicSector,
  PublicSectorDetail,
  RawAdminSector,
  SectorSection,
  SectorSectionSummary,
  SectorSectionUpsertPayload,
  UpdateSectorPayload,
} from "./types";

function normalizeAdminSector(raw: RawAdminSector): AdminSector {
  const { id, _id, ...rest } = raw;
  return { ...rest, id: id ?? _id ?? "" };
}

/**
 * Server-only, public: published sectors sorted by order. No public page
 * consumes this yet — Sectors is currently an admin-only content type — but
 * mirrors `getPublicCaseStudies`'s shape for when one lands.
 */
export async function getPublicSectors(): Promise<PublicSector[]> {
  return serverPublicFetch<PublicSector[]>("/api/sectors/public");
}

/**
 * Server-only, public: full detail for one sector. 404s (via `ApiError`) if
 * missing or unpublished — mirrors `getPublicCaseStudy`.
 */
export async function getPublicSectorBySlug(
  slug: string
): Promise<PublicSectorDetail> {
  return serverPublicFetch<PublicSectorDetail>(`/api/sectors/public/${slug}`);
}

/** Server-only, admin: every sector, including unpublished. */
export async function listAdminSectors(): Promise<AdminSector[]> {
  const data = await serverApiFetch<RawAdminSector[]>("/api/sectors");
  return data.map(normalizeAdminSector);
}

/** Server-only, admin: a single sector's identity/publish state. */
export async function getAdminSector(id: string): Promise<AdminSector> {
  const data = await serverApiFetch<RawAdminSector>(`/api/sectors/${id}`);
  return normalizeAdminSector(data);
}

/**
 * Name + background-asset create — unlike `createCaseStudy` (title only), a
 * `Sector` needs its mandatory `backgroundAsset` up front. Routes the admin
 * straight into `/admin/sectors/[id]` on success to fill in the 10 sections
 * afterwards, one at a time.
 */
export async function createSector(
  payload: CreateSectorPayload
): Promise<AdminSector> {
  const data = await apiFetch<RawAdminSector>("/api/sectors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeAdminSector(data);
}

/** Name/backgroundAsset/publish state only — slug and order are never accepted here. */
export async function updateSector(
  id: string,
  payload: UpdateSectorPayload
): Promise<AdminSector> {
  const data = await apiFetch<RawAdminSector>(`/api/sectors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeAdminSector(data);
}

export async function deleteSector(id: string): Promise<void> {
  await apiFetch<RawAdminSector>(`/api/sectors/${id}`, {
    method: "DELETE",
  });
}

/**
 * Reorders the whole board in one shot. `orderedIds` must be the exact full
 * set of sector ids — the backend 400s on a partial list — so callers submit
 * the entire locally-held list, not a diff (mirrors `reorderCaseStudies`).
 */
export async function reorderSectors(orderedIds: string[]): Promise<void> {
  await apiFetch<undefined>("/api/sectors/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}

/** Server-only, admin: the fixed 10-entry section summary for the hub page. */
export async function listSectorSections(
  id: string
): Promise<SectorSectionSummary[]> {
  return serverApiFetch<SectorSectionSummary[]>(`/api/sectors/${id}/sections`);
}

/**
 * Server-only, admin: a single section. Never 404s for an unseeded section —
 * the backend answers with its registry defaults and `exists: false`, same
 * discipline as `getCaseStudySectionForAdmin`.
 */
export async function getSectorSectionForAdmin(
  id: string,
  section: SectorSection
): Promise<AdminSectorSectionDoc> {
  return serverApiFetch<AdminSectorSectionDoc>(
    `/api/sectors/${id}/sections/${section}`
  );
}

/** Client-side twin of `getSectorSectionForAdmin`, used to re-read after a reset. */
export async function fetchSectorSectionForAdmin(
  id: string,
  section: SectorSection
): Promise<AdminSectorSectionDoc> {
  return apiFetch<AdminSectorSectionDoc>(`/api/sectors/${id}/sections/${section}`);
}

/**
 * Full replace, not a merge — same contract as `saveCaseStudySection`.
 */
export async function saveSectorSection(
  id: string,
  section: SectorSection,
  payload: SectorSectionUpsertPayload
): Promise<AdminSectorSectionDoc> {
  return apiFetch<AdminSectorSectionDoc>(`/api/sectors/${id}/sections/${section}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Resets a section to the backend's registry defaults. */
export async function resetSectorSection(
  id: string,
  section: SectorSection
): Promise<void> {
  await apiFetch<undefined>(`/api/sectors/${id}/sections/${section}`, {
    method: "DELETE",
  });
}
