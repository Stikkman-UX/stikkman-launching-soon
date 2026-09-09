"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminShowcaseCard } from "@/lib/api/types";
import {
  deleteShowcaseCard,
  reorderShowcaseCards,
  updateShowcaseCard,
} from "@/lib/api/showcaseCards";
import { resolveErrorMessage } from "@/lib/api/errors";

const SECTOR_LABELS: Record<AdminShowcaseCard["sector"], string> = {
  saas: "SaaS",
  b2b: "B2B",
  ecommerce: "Ecommerce",
  fintech: "Fintech",
};

/**
 * Mirrors `CaseStudiesAdminBoard`'s flat, single-order list UX (publish
 * toggle, up/down reorder, delete-with-confirm) plus `ProjectsAdminBoard`'s
 * thumbnail block — this resource has one global order, like case studies,
 * unlike Projects' two-section split.
 */
export default function ShowcaseCardsAdminBoard({
  initialCards,
}: {
  initialCards: AdminShowcaseCard[];
}) {
  const [cards, setCards] = useState(
    [...initialCards].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  async function handleTogglePublish(card: AdminShowcaseCard) {
    setError(null);
    setPendingId(card.id);
    const nextPublished = !card.isPublished;

    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isPublished: nextPublished } : c))
    );

    try {
      await updateShowcaseCard(card.id, { isPublished: nextPublished });
    } catch (err) {
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isPublished: card.isPublished } : c))
      );
      setError(resolveErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const swapped = [...cards];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const orderedIds = swapped.map((c) => c.id);
    const reindexed = swapped.map((c, i) => ({ ...c, order: i }));

    setError(null);
    setIsReordering(true);
    const snapshot = cards;
    setCards(reindexed);

    try {
      await reorderShowcaseCards(orderedIds);
    } catch (err) {
      setCards(snapshot);
      setError(resolveErrorMessage(err));
    } finally {
      setIsReordering(false);
    }
  }

  async function handleDelete(card: AdminShowcaseCard) {
    const confirmed = window.confirm(`Delete "${card.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setError(null);
    setPendingId(card.id);
    const snapshot = cards;
    setCards((prev) => prev.filter((c) => c.id !== card.id));

    try {
      await deleteShowcaseCard(card.id);
    } catch (err) {
      setCards(snapshot);
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
          href="/admin/showcase-cards/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Add card
        </Link>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
          No showcase cards yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cards.map((card, index) => (
            <li
              key={card.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:w-32">
                {card.assetPreview ? (
                  // Admin-only thumbnail preview of an arbitrary S3 URL —
                  // next/image would require a remotePatterns allowlist for
                  // a domain we don't control here (same reasoning as
                  // `ProjectsAdminBoard`'s thumbnail).
                  card.assetPreview.type === "video" ? (
                    <video
                      src={card.assetPreview.url}
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.assetPreview.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm text-neutral-900">{card.title}</h3>
                  <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-neutral-500">
                    {SECTOR_LABELS[card.sector]}
                  </span>
                  {card.highlight && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-amber-600">
                      Highlight
                    </span>
                  )}
                  {card.isBigCard && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-blue-600">
                      Big card
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                  {card.description}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400">
                  {card.isPublished ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || isReordering}
                  aria-label={`Move ${card.title} up`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === cards.length - 1 || isReordering}
                  aria-label={`Move ${card.title} down`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(card)}
                  disabled={pendingId === card.id}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-50"
                >
                  {card.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/showcase-cards/${card.id}/edit`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(card)}
                  disabled={pendingId === card.id}
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
