"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminSector } from "@/lib/api/types";
import { deleteSector, reorderSectors, updateSector } from "@/lib/api/sectors";
import { resolveErrorMessage } from "@/lib/api/errors";

/**
 * Mirrors `CaseStudiesAdminBoard`'s optimistic publish/reorder/delete UX
 * against a single flat, ordered list, plus `ShowcaseCardsAdminBoard`'s
 * thumbnail block for the mandatory `backgroundAsset` (case studies have no
 * board-level thumbnail to mirror).
 */
export default function SectorsAdminBoard({
  initialSectors,
}: {
  initialSectors: AdminSector[];
}) {
  const [sectors, setSectors] = useState(
    [...initialSectors].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  async function handleTogglePublish(sector: AdminSector) {
    setError(null);
    setPendingId(sector.id);
    const nextPublished = !sector.isPublished;

    setSectors((prev) =>
      prev.map((s) =>
        s.id === sector.id ? { ...s, isPublished: nextPublished } : s
      )
    );

    try {
      await updateSector(sector.id, { isPublished: nextPublished });
    } catch (err) {
      setSectors((prev) =>
        prev.map((s) =>
          s.id === sector.id ? { ...s, isPublished: sector.isPublished } : s
        )
      );
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sectors.length) return;

    const swapped = [...sectors];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const orderedIds = swapped.map((s) => s.id);
    const reindexed = swapped.map((s, i) => ({ ...s, order: i }));

    setError(null);
    setIsReordering(true);
    const snapshot = sectors;
    setSectors(reindexed);

    try {
      await reorderSectors(orderedIds);
    } catch (err) {
      setSectors(snapshot);
      setError(resolveErrorMessage(err));
    } finally {
      setIsReordering(false);
    }
  }

  async function handleDelete(sector: AdminSector) {
    const confirmed = window.confirm(
      `Delete "${sector.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setPendingId(sector.id);
    const snapshot = sectors;
    setSectors((prev) => prev.filter((s) => s.id !== sector.id));

    try {
      await deleteSector(sector.id);
    } catch (err) {
      setSectors(snapshot);
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
          href="/admin/sectors/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Add sector
        </Link>
      </div>

      {sectors.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
          No sectors yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sectors.map((sector, index) => (
            <li
              key={sector.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:w-32">
                {sector.backgroundAssetPreview ? (
                  // Admin-only thumbnail preview of an arbitrary S3 URL —
                  // next/image would require a remotePatterns allowlist for
                  // a domain we don't control here (same reasoning as
                  // `ShowcaseCardsAdminBoard`'s thumbnail).
                  sector.backgroundAssetPreview.type === "video" ? (
                    <video
                      src={sector.backgroundAssetPreview.url}
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sector.backgroundAssetPreview.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm text-neutral-900">
                  {sector.name}
                </h3>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  /{sector.slug}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400">
                  {sector.isPublished ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || isReordering}
                  aria-label={`Move ${sector.name} up`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === sectors.length - 1 || isReordering}
                  aria-label={`Move ${sector.name} down`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(sector)}
                  disabled={pendingId === sector.id}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-50"
                >
                  {sector.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/sectors/${sector.id}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(sector)}
                  disabled={pendingId === sector.id}
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
