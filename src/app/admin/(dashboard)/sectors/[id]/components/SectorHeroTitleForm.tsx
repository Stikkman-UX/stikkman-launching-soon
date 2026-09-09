"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateSector } from "@/lib/api/sectors";
import { resolveErrorMessage } from "@/lib/api/errors";

/**
 * The Hero heading is the one piece of top-level sector copy an admin can
 * change after creation — `name`/`slug` are deliberately immutable (the slug
 * is derived from the name, so letting it drift would leave the URL
 * disagreeing with the label), and everything else lives in one of the 10
 * sections. It sits on the hub rather than the board because it's editorial
 * copy for this sector's page, not board-level chrome like publish/reorder.
 *
 * One rendered line per row, matching the newline-separated `stringList`
 * convention used across the section editors.
 */
export default function SectorHeroTitleForm({
  sectorId,
  heroTitle,
}: {
  sectorId: string;
  heroTitle: string[];
}) {
  const router = useRouter();

  const [value, setValue] = useState(heroTitle.join("\n"));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSavedAt(null);

    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Please enter at least one heading line.");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateSector(sectorId, { heroTitle: lines });
      // Adopt the server's normalized value rather than the local draft, so
      // the textarea reflects exactly what was stored (same discipline as
      // `SectionEditor` adopting its PUT response).
      setValue(updated.heroTitle.join("\n"));
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Hero heading
        <textarea
          rows={3}
          value={value}
          disabled={isSaving}
          onChange={(event) => setValue(event.target.value)}
          className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 disabled:opacity-50"
        />
        <span className="text-xs text-neutral-400">
          One rendered line per row — controls whether the Hero heading breaks
          across 1, 2, or 3 lines.
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="w-fit rounded-full bg-neutral-900 px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save heading"}
        </button>

        {savedAt && !isSaving && (
          <span className="text-xs text-neutral-400">Saved</span>
        )}
      </div>
    </form>
  );
}
