"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminShowcaseCard, Sector } from "@/lib/api/types";
import { createShowcaseCard, updateShowcaseCard } from "@/lib/api/showcaseCards";
import { replaceAsset, uploadAsset } from "@/lib/api/assets";
import { resolveErrorMessage } from "@/lib/api/errors";
import { ASSET_ACCEPT } from "@/lib/constants";

const SECTOR_OPTIONS: { value: Sector; label: string }[] = [
  { value: "saas", label: "SaaS" },
  { value: "b2b", label: "B2B" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "fintech", label: "Fintech" },
];

type ShowcaseCardFormProps =
  | { mode: "create"; card?: undefined }
  | { mode: "edit"; card: AdminShowcaseCard };

export default function ShowcaseCardForm({ mode, card }: ShowcaseCardFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [sector, setSector] = useState<Sector>(card?.sector ?? "saas");
  const [tags, setTags] = useState(card?.tags.join(", ") ?? "");
  const [readingTime, setReadingTime] = useState(card?.readingTime ?? "");
  const [href, setHref] = useState(card?.href ?? "");
  const [highlight, setHighlight] = useState(card?.highlight ?? false);
  const [isBigCard, setIsBigCard] = useState(card?.isBigCard ?? false);
  const [isPublished, setIsPublished] = useState(card?.isPublished ?? false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    card?.assetPreview?.url ?? null
  );
  const [previewType, setPreviewType] = useState<"image" | "video">(
    card?.assetPreview?.type ?? "image"
  );
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
      setPreviewUrl(card?.assetPreview?.url ?? null);
      setPreviewType(card?.assetPreview?.type ?? "image");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file && !card?.asset) {
      setError("Please choose an asset.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Only ever pass through the backend-issued assetId — never construct
      // or guess an S3 URL on the frontend.
      let assetId = card?.asset ?? "";
      if (file) {
        const asset = card?.asset
          ? await replaceAsset(card.asset, file)
          : await uploadAsset(file);
        assetId = asset.assetId;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        asset: assetId,
        sector,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        readingTime: readingTime.trim(),
        href: href.trim(),
        highlight,
        isBigCard,
        isPublished,
      };

      if (mode === "edit" && card) {
        await updateShowcaseCard(card.id, payload);
      } else {
        await createShowcaseCard(payload);
      }

      router.push("/admin/showcase-cards");
      router.refresh();
    } catch (err) {
      setError(resolveErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Title
        <input
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Description
        <textarea
          required
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
      </label>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-neutral-700">
          Sector
          <select
            value={sector}
            onChange={(event) => setSector(event.target.value as Sector)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
          >
            {SECTOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-700">
          Reading time
          <input
            type="text"
            value={readingTime}
            onChange={(event) => setReadingTime(event.target.value)}
            placeholder="5 min read"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Tags (comma-separated)
        <input
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Design, Growth, Platform"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Link (optional)
        <input
          type="text"
          value={href}
          onChange={(event) => setHref(event.target.value)}
          placeholder="/work/case-study-slug or https://example.com"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
        <span className="text-xs text-neutral-400">
          Leave blank to send visitors to a 404 page instead.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(event) => setHighlight(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          Show in hero carousel
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isBigCard}
            onChange={(event) => setIsBigCard(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          Display as a large card in the grid
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          Published
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-neutral-700">Asset</span>

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
          {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create card"}
        </button>

        <Link
          href="/admin/showcase-cards"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
