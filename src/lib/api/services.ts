import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AdminService,
  AdminServiceSectionDoc,
  CreateServicePayload,
  PublicService,
  PublicServiceDetail,
  RawAdminService,
  ServiceSection,
  ServiceSectionSummary,
  ServiceSectionUpsertPayload,
  UpdateServicePayload,
} from "./types";

function normalizeAdminService(raw: RawAdminService): AdminService {
  const { id, _id, ...rest } = raw;
  return { ...rest, id: id ?? _id ?? "" };
}

/** Server-only, public: published services sorted by order. Powers `generateStaticParams`. */
export async function getPublicServices(): Promise<PublicService[]> {
  return serverPublicFetch<PublicService[]>("/api/services/public");
}

/**
 * Server-only, public: full detail for one service. 404s (via `ApiError`) if
 * missing or unpublished — mirrors `getPublicSectorBySlug`.
 */
export async function getPublicServiceBySlug(
  slug: string
): Promise<PublicServiceDetail> {
  return serverPublicFetch<PublicServiceDetail>(`/api/services/public/${slug}`);
}

/** Server-only, admin: every service, including unpublished. */
export async function listAdminServices(): Promise<AdminService[]> {
  const data = await serverApiFetch<RawAdminService[]>("/api/services");
  return data.map(normalizeAdminService);
}

/** Server-only, admin: a single service's identity/publish state. */
export async function getAdminService(id: string): Promise<AdminService> {
  const data = await serverApiFetch<RawAdminService>(`/api/services/${id}`);
  return normalizeAdminService(data);
}

/**
 * Name + background-asset create — mirrors `createSector`. Routes the admin
 * straight into `/admin/services/[id]` on success to fill in the 7 sections
 * afterwards, one at a time.
 */
export async function createService(
  payload: CreateServicePayload
): Promise<AdminService> {
  const data = await apiFetch<RawAdminService>("/api/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeAdminService(data);
}

/** `backgroundAsset`/publish state only — name/slug/order are never accepted here. */
export async function updateService(
  id: string,
  payload: UpdateServicePayload
): Promise<AdminService> {
  const data = await apiFetch<RawAdminService>(`/api/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeAdminService(data);
}

export async function deleteService(id: string): Promise<void> {
  await apiFetch<RawAdminService>(`/api/services/${id}`, {
    method: "DELETE",
  });
}

/**
 * Reorders the whole board in one shot. `orderedIds` must be the exact full
 * set of service ids — the backend 400s on a partial list — so callers submit
 * the entire locally-held list, not a diff (mirrors `reorderSectors`).
 */
export async function reorderServices(orderedIds: string[]): Promise<void> {
  await apiFetch<undefined>("/api/services/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}

/** Server-only, admin: the fixed 7-entry section summary for the hub page. */
export async function listServiceSections(
  id: string
): Promise<ServiceSectionSummary[]> {
  return serverApiFetch<ServiceSectionSummary[]>(`/api/services/${id}/sections`);
}

/**
 * Server-only, admin: a single section. Never 404s for an unseeded section —
 * the backend answers with its registry defaults and `exists: false`, same
 * discipline as `getSectorSectionForAdmin`.
 */
export async function getServiceSectionForAdmin(
  id: string,
  section: ServiceSection
): Promise<AdminServiceSectionDoc> {
  return serverApiFetch<AdminServiceSectionDoc>(
    `/api/services/${id}/sections/${section}`
  );
}

/** Client-side twin of `getServiceSectionForAdmin`, used to re-read after a reset. */
export async function fetchServiceSectionForAdmin(
  id: string,
  section: ServiceSection
): Promise<AdminServiceSectionDoc> {
  return apiFetch<AdminServiceSectionDoc>(`/api/services/${id}/sections/${section}`);
}

/** Full replace, not a merge — same contract as `saveSectorSection`. */
export async function saveServiceSection(
  id: string,
  section: ServiceSection,
  payload: ServiceSectionUpsertPayload
): Promise<AdminServiceSectionDoc> {
  return apiFetch<AdminServiceSectionDoc>(`/api/services/${id}/sections/${section}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Resets a section to the backend's registry defaults. */
export async function resetServiceSection(
  id: string,
  section: ServiceSection
): Promise<void> {
  await apiFetch<undefined>(`/api/services/${id}/sections/${section}`, {
    method: "DELETE",
  });
}
