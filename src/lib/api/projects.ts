import { apiFetch, serverApiFetch } from "./client";
import type {
  AdminProject,
  CreateProjectPayload,
  HomeProjectCard,
  ProjectSection,
  RawAdminProject,
  UpdateProjectPayload,
} from "./types";

function normalizeAdminProject(raw: RawAdminProject): AdminProject {
  const { id, _id, ...rest } = raw;
  return { ...rest, id: id ?? _id ?? "" };
}

/**
 * Server-only: powers the public Home page. Callers (`src/app/page.tsx`)
 * are responsible for falling back to the static `projectsPartOne`/
 * `projectsPartTwo` arrays per-section if a section comes back empty, or
 * entirely if this throws.
 */
export async function getHomeProjects(): Promise<{
  partOne: HomeProjectCard[];
  partTwo: HomeProjectCard[];
}> {
  const data = await serverApiFetch<{
    sectionOne: HomeProjectCard[];
    sectionTwo: HomeProjectCard[];
  }>("/api/projects/home");

  return { partOne: data.sectionOne, partTwo: data.sectionTwo };
}

/** Server-only, admin: full project list (including unpublished), sorted. */
export async function listAdminProjects(): Promise<AdminProject[]> {
  const data = await serverApiFetch<RawAdminProject[]>("/api/projects");
  return data.map(normalizeAdminProject);
}

/** Server-only, admin: a single project by id. */
export async function getAdminProject(id: string): Promise<AdminProject> {
  const data = await serverApiFetch<RawAdminProject>(`/api/projects/${id}`);
  return normalizeAdminProject(data);
}

export async function createProject(
  payload: CreateProjectPayload
): Promise<AdminProject> {
  const data = await apiFetch<RawAdminProject>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeAdminProject(data);
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<AdminProject> {
  const data = await apiFetch<RawAdminProject>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeAdminProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch<RawAdminProject>(`/api/projects/${id}`, { method: "DELETE" });
}

/**
 * Reorders a whole section in one shot. `orderedIds` must be exactly the
 * full set of project ids currently in that section — the backend 400s
 * otherwise — so callers must submit the entire locally-held list, not a
 * partial diff.
 */
export async function reorderProjects(
  section: ProjectSection,
  orderedIds: string[]
): Promise<void> {
  await apiFetch<undefined>("/api/projects/reorder", {
    method: "PATCH",
    body: JSON.stringify({ section, orderedIds }),
  });
}
