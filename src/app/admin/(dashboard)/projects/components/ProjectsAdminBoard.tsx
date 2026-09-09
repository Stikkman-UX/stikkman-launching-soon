"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminProject, ProjectSection } from "@/lib/api/types";
import { deleteProject, reorderProjects, updateProject } from "@/lib/api/projects";
import { resolveErrorMessage } from "@/lib/api/errors";

const SECTIONS: { key: ProjectSection; label: string }[] = [
  { key: "one", label: "Section One" },
  { key: "two", label: "Section Two" },
];

function sortBySection(projects: AdminProject[]): Record<ProjectSection, AdminProject[]> {
  const grouped: Record<ProjectSection, AdminProject[]> = { one: [], two: [] };

  for (const project of projects) {
    grouped[project.section].push(project);
  }

  grouped.one.sort((a, b) => a.order - b.order);
  grouped.two.sort((a, b) => a.order - b.order);

  return grouped;
}

export default function ProjectsAdminBoard({
  initialProjects,
  visibleSections,
}: {
  initialProjects: AdminProject[];
  /** Omitted (the default) renders every section — the `?section` filter is
   *  purely additive so the bare `/admin/projects` view is unchanged. */
  visibleSections?: ProjectSection[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reorderingSection, setReorderingSection] = useState<ProjectSection | null>(null);

  const bySection = useMemo(() => sortBySection(projects), [projects]);

  async function handleTogglePublish(project: AdminProject) {
    setError(null);
    setPendingId(project.id);
    const nextPublished = !project.isPublished;

    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, isPublished: nextPublished } : p))
    );

    try {
      await updateProject(project.id, { isPublished: nextPublished });
    } catch (err) {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPublished: project.isPublished } : p))
      );
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(section: ProjectSection, index: number, direction: -1 | 1) {
    const sectionProjects = bySection[section];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= sectionProjects.length) return;

    const swapped = [...sectionProjects];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const orderedIds = swapped.map((p) => p.id);
    const reindexed = swapped.map((p, i) => ({ ...p, order: i }));

    setError(null);
    setReorderingSection(section);
    setProjects((prev) => [...prev.filter((p) => p.section !== section), ...reindexed]);

    try {
      await reorderProjects(section, orderedIds);
    } catch (err) {
      setProjects((prev) => [...prev.filter((p) => p.section !== section), ...sectionProjects]);
      setError(resolveErrorMessage(err));
    } finally {
      setReorderingSection(null);
    }
  }

  async function handleDelete(project: AdminProject) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setPendingId(project.id);
    const snapshot = projects;
    setProjects((prev) => prev.filter((p) => p.id !== project.id));

    try {
      await deleteProject(project.id);
    } catch (err) {
      setProjects(snapshot);
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {SECTIONS.filter(
        ({ key }) => !visibleSections || visibleSections.includes(key)
      ).map(({ key, label }) => {
        const sectionProjects = bySection[key];
        const isReordering = reorderingSection === key;

        return (
          <section key={key} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-neutral-900">{label}</h2>
              <Link
                href={`/admin/projects/new?section=${key}`}
                className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                Add project
              </Link>
            </div>

            {sectionProjects.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
                No projects yet in this section.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {sectionProjects.map((project, index) => (
                  <li
                    key={project.id}
                    className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:w-32">
                      {project.assetPreviews[0] ? (
                        // Admin-only thumbnail preview of an arbitrary S3
                        // URL — next/image would require a remotePatterns
                        // allowlist for a domain we don't control here.
                        // Shows only the first of the 4 grid slots as the
                        // board's representative thumbnail.
                        project.assetPreviews[0].type === "video" ? (
                          <video
                            src={project.assetPreviews[0].url}
                            muted
                            loop
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.assetPreviews[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm text-neutral-900">{project.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                        {project.description}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400">
                        {project.isPublished ? "Published" : "Draft"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMove(key, index, -1)}
                        disabled={index === 0 || isReordering}
                        aria-label={`Move ${project.title} up`}
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(key, index, 1)}
                        disabled={index === sectionProjects.length - 1 || isReordering}
                        aria-label={`Move ${project.title} down`}
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(project)}
                        disabled={pendingId === project.id}
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-50"
                      >
                        {project.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        disabled={pendingId === project.id}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
