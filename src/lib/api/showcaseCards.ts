import { apiFetch, serverApiFetch, serverPublicFetch } from "./client";
import type {
  AdminShowcaseCard,
  CreateShowcaseCardPayload,
  PublicShowcaseCard,
  RawAdminShowcaseCard,
  UpdateShowcaseCardPayload,
} from "./types";

function normalizeAdminShowcaseCard(raw: RawAdminShowcaseCard): AdminShowcaseCard {
  const { id, _id, ...rest } = raw;
  return { ...rest, id: id ?? _id ?? "" };
}

/**
 * Server-only, public: published showcase cards sorted by order. Powers the
 * `/work-innovation` index (hero carousel + grid). Deliberately never touches
 * `next/headers`'s `cookies()` (via `serverPublicFetch`) so the page stays
 * ISR-eligible.
 */
export async function getPublicShowcaseCards(): Promise<PublicShowcaseCard[]> {
  return serverPublicFetch<PublicShowcaseCard[]>("/api/showcase-cards/public");
}

/** Server-only, admin: every showcase card, including unpublished. */
export async function listAdminShowcaseCards(): Promise<AdminShowcaseCard[]> {
  const data = await serverApiFetch<RawAdminShowcaseCard[]>("/api/showcase-cards");
  return data.map(normalizeAdminShowcaseCard);
}

/** Server-only, admin: a single showcase card by id. */
export async function getAdminShowcaseCard(id: string): Promise<AdminShowcaseCard> {
  const data = await serverApiFetch<RawAdminShowcaseCard>(`/api/showcase-cards/${id}`);
  return normalizeAdminShowcaseCard(data);
}

export async function createShowcaseCard(
  payload: CreateShowcaseCardPayload
): Promise<AdminShowcaseCard> {
  const data = await apiFetch<RawAdminShowcaseCard>("/api/showcase-cards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeAdminShowcaseCard(data);
}

export async function updateShowcaseCard(
  id: string,
  payload: UpdateShowcaseCardPayload
): Promise<AdminShowcaseCard> {
  const data = await apiFetch<RawAdminShowcaseCard>(`/api/showcase-cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeAdminShowcaseCard(data);
}

export async function deleteShowcaseCard(id: string): Promise<void> {
  await apiFetch<RawAdminShowcaseCard>(`/api/showcase-cards/${id}`, {
    method: "DELETE",
  });
}

/**
 * Reorders the whole board in one shot. `orderedIds` must be the exact full
 * set of showcase card ids — the backend 400s on a partial list — so callers
 * submit the entire locally-held list, not a diff (mirrors `reorderCaseStudies`).
 */
export async function reorderShowcaseCards(orderedIds: string[]): Promise<void> {
  await apiFetch<undefined>("/api/showcase-cards/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}
