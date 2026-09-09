"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminService } from "@/lib/api/types";
import { deleteService, reorderServices, updateService } from "@/lib/api/services";
import { resolveErrorMessage } from "@/lib/api/errors";

/**
 * Mirrors `SectorsAdminBoard`'s optimistic publish/reorder/delete UX against
 * a single flat, ordered list, including the thumbnail block for the
 * mandatory `backgroundAsset`.
 */
export default function ServicesAdminBoard({
  initialServices,
}: {
  initialServices: AdminService[];
}) {
  const [services, setServices] = useState(
    [...initialServices].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  async function handleTogglePublish(service: AdminService) {
    setError(null);
    setPendingId(service.id);
    const nextPublished = !service.isPublished;

    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, isPublished: nextPublished } : s
      )
    );

    try {
      await updateService(service.id, { isPublished: nextPublished });
    } catch (err) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, isPublished: service.isPublished } : s
        )
      );
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const swapped = [...services];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const orderedIds = swapped.map((s) => s.id);
    const reindexed = swapped.map((s, i) => ({ ...s, order: i }));

    setError(null);
    setIsReordering(true);
    const snapshot = services;
    setServices(reindexed);

    try {
      await reorderServices(orderedIds);
    } catch (err) {
      setServices(snapshot);
      setError(resolveErrorMessage(err));
    } finally {
      setIsReordering(false);
    }
  }

  async function handleDelete(service: AdminService) {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setPendingId(service.id);
    const snapshot = services;
    setServices((prev) => prev.filter((s) => s.id !== service.id));

    try {
      await deleteService(service.id);
    } catch (err) {
      setServices(snapshot);
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
          href="/admin/services/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Add service
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
          No services yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service, index) => (
            <li
              key={service.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:w-32">
                {service.backgroundAssetPreview ? (
                  // Admin-only thumbnail preview of an arbitrary S3 URL —
                  // next/image would require a remotePatterns allowlist for
                  // a domain we don't control here (same reasoning as
                  // `SectorsAdminBoard`'s thumbnail).
                  service.backgroundAssetPreview.type === "video" ? (
                    <video
                      src={service.backgroundAssetPreview.url}
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.backgroundAssetPreview.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm text-neutral-900">
                  {service.name}
                </h3>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  /{service.slug}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400">
                  {service.isPublished ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || isReordering}
                  aria-label={`Move ${service.name} up`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === services.length - 1 || isReordering}
                  aria-label={`Move ${service.name} down`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(service)}
                  disabled={pendingId === service.id}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-50"
                >
                  {service.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/services/${service.id}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(service)}
                  disabled={pendingId === service.id}
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
