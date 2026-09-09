"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSector } from "@/lib/api/sectors";
import { uploadAsset } from "@/lib/api/assets";
import { resolveErrorMessage } from "@/lib/api/errors";
import { ASSET_ACCEPT } from "@/lib/constants";

/**
 * Name + a required background asset, uploaded on submit and passed through
 * as an assetId to `createSector` — mirrors `ShowcaseCardForm`'s
 * upload-then-create flow. Unlike `CaseStudyCreateForm` (title only), a
 * `Sector` needs its background asset up front since `backgroundAsset` is
 * mandatory on the parent document. Routes straight into the section hub
 * (`/admin/sectors/[id]`) on success to fill in the 10 sections afterwards,
 * one at a time — same discipline as case studies.
 *
 * `name` is the slug source and admin label — immutable once created, since
 * `slug` is derived from it. The Hero heading is a separate, freely-editable
 * `heroTitle`, entered one rendered line per row of the textarea (same
 * newline-separated convention as the `stringList` section field kind) so
 * the admin controls whether it renders on 1, 2, or 3 lines. Left blank it
 * defaults to `[name]` server-side, and can be edited later from the hub.
 */
export default function SectorCreateForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [heroTitleInput, setHeroTitleInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video">("image");
  const objectUrlRef = useRef<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (picked) {
      const url = URL.createObjectURL(picked);
      objectUrlRef.current = url;
      setFile(picked);
      setPreviewUrl(url);
      setPreviewType(picked.type.startsWith("video/") ? "video" : "image");
    } else {
      setFile(null);
      setPreviewUrl(null);
      setPreviewType("image");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a name.");
      return;
    }

    const heroTitle = heroTitleInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!file) {
      setError("Please choose a background asset.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Only ever pass through the backend-issued assetId — never construct
      // or guess an S3 URL on the frontend.
      const asset = await uploadAsset(file);

      const sector = await createSector({
        name: trimmedName,
        // Omitted entirely when blank so the backend applies its `[name]`
        // default rather than receiving an empty array it would reject.
        ...(heroTitle.length > 0 ? { heroTitle } : {}),
        backgroundAsset: asset.assetId,
      });

      router.push(`/admin/sectors/${sector.id}`);
      router.refresh();
    } catch (err) {
      setError(resolveErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Name
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
        <span className="text-xs text-neutral-400">
          Used for the admin label and the page URL. Cannot be changed later.
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Hero heading
        <textarea
          rows={3}
          value={heroTitleInput}
          onChange={(event) => setHeroTitleInput(event.target.value)}
          className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
        <span className="text-xs text-neutral-400">
          One rendered line per row — controls whether the Hero heading breaks
          across 1, 2, or 3 lines. Leave blank to use the name; editable any
          time afterwards.
        </span>
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-neutral-700">Background asset</span>

        <div className="flex max-w-xs flex-col gap-2">
          {previewUrl ? (
            previewType === "video" ? (
              <video
                src={previewUrl}
                muted
                loop
                playsInline
                className="aspect-4/3 w-full rounded-lg bg-neutral-100 object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="aspect-4/3 w-full rounded-lg bg-neutral-100 object-cover"
              />
            )
          ) : (
            <div className="aspect-4/3 w-full rounded-lg bg-neutral-100" />
          )}

          <input
            type="file"
            accept={ASSET_ACCEPT}
            onChange={handleFileChange}
            className="text-xs text-neutral-600"
          />
        </div>
      </div>

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
          disabled={isSubmitting}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create sector"}
        </button>

        <Link
          href="/admin/sectors"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
