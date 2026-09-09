"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminCaseStudy } from "@/lib/api/types";
import {
  deleteCaseStudy,
  reorderCaseStudies,
  updateCaseStudy,
} from "@/lib/api/caseStudies";
import { resolveErrorMessage } from "@/lib/api/errors";

/**
 * Mirrors `ProjectsAdminBoard`'s UX (publish toggle, up/down reorder,
 * delete-with-confirm) against a single flat, ordered list — case studies
 * have no Projects-style section split.
 */
export default function CaseStudiesAdminBoard({
  initialCaseStudies,
}: {
  initialCaseStudies: AdminCaseStudy[];
}) {
  const [caseStudies, setCaseStudies] = useState(
    [...initialCaseStudies].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  async function handleTogglePublish(caseStudy: AdminCaseStudy) {
    setError(null);
    setPendingId(caseStudy.id);
    const nextPublished = !caseStudy.isPublished;

    setCaseStudies((prev) =>
      prev.map((cs) =>
        cs.id === caseStudy.id ? { ...cs, isPublished: nextPublished } : cs
      )
    );

    try {
      await updateCaseStudy(caseStudy.id, { isPublished: nextPublished });
    } catch (err) {
      setCaseStudies((prev) =>
        prev.map((cs) =>
          cs.id === caseStudy.id
            ? { ...cs, isPublished: caseStudy.isPublished }
            : cs
        )
      );
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= caseStudies.length) return;

    const swapped = [...caseStudies];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const orderedIds = swapped.map((cs) => cs.id);
    const reindexed = swapped.map((cs, i) => ({ ...cs, order: i }));

    setError(null);
    setIsReordering(true);
    const snapshot = caseStudies;
    setCaseStudies(reindexed);

    try {
      await reorderCaseStudies(orderedIds);
    } catch (err) {
      setCaseStudies(snapshot);
      setError(resolveErrorMessage(err));
    } finally {
      setIsReordering(false);
    }
  }

  async function handleDelete(caseStudy: AdminCaseStudy) {
    const confirmed = window.confirm(
      `Delete "${caseStudy.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setPendingId(caseStudy.id);
    const snapshot = caseStudies;
    setCaseStudies((prev) => prev.filter((cs) => cs.id !== caseStudy.id));

    try {
      await deleteCaseStudy(caseStudy.id);
    } catch (err) {
      setCaseStudies(snapshot);
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Link
          href="/admin/case-studies/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Add case study
        </Link>
      </div>

      {caseStudies.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
          No case studies yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {caseStudies.map((caseStudy, index) => (
            <li
              key={caseStudy.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm text-neutral-900">
                  {caseStudy.title}
                </h3>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  /work/{caseStudy.slug}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400">
                  {caseStudy.isPublished ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || isReordering}
                  aria-label={`Move ${caseStudy.title} up`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === caseStudies.length - 1 || isReordering}
                  aria-label={`Move ${caseStudy.title} down`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(caseStudy)}
                  disabled={pendingId === caseStudy.id}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-50"
                >
                  {caseStudy.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/case-studies/${caseStudy.id}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(caseStudy)}
                  disabled={pendingId === caseStudy.id}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
