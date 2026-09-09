"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminProject, ProjectSection } from "@/lib/api/types";
import { createProject, updateProject } from "@/lib/api/projects";
import { replaceAsset, uploadAsset } from "@/lib/api/assets";
import { resolveErrorMessage } from "@/lib/api/errors";
import { ASSET_ACCEPT } from "@/lib/constants";

const SLOT_COUNT = 4;
const SLOT_LABELS = ["Asset 1", "Asset 2", "Asset 3", "Asset 4"];

type Slot = {
  /** A freshly picked replacement file, or null if the slot still holds
   *  whatever asset it started with (or is empty, in create mode). */
  file: File | null;
  previewUrl: string | null;
  previewType: "image" | "video";
};

function initialSlots(project?: AdminProject): Slot[] {
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const preview = project?.assetPreviews[i];
    return {
      file: null,
      previewUrl: preview?.url ?? null,
      previewType: preview?.type ?? "image",
    };
  });
}

type ProjectFormProps =
  | { mode: "create"; project?: undefined; initialSection?: ProjectSection }
  | { mode: "edit"; project: AdminProject; initialSection?: undefined };

export default function ProjectForm({ mode, project, initialSection }: ProjectFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [section, setSection] = useState<ProjectSection>(
    project?.section ?? initialSection ?? "one"
  );
  const [isPublished, setIsPublished] = useState(project?.isPublished ?? false);
  const [href, setHref] = useState(project?.href ?? "");

  const [slots, setSlots] = useState<Slot[]>(() => initialSlots(project));
  const objectUrlsRef = useRef<(string | null)[]>(
    Array.from({ length: SLOT_COUNT }, () => null)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls) {
        if (url) URL.revokeObjectURL(url);
      }
    };
  }, []);

  function handleSlotFileChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    const oldUrl = objectUrlsRef.current[index];
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
      objectUrlsRef.current[index] = null;
    }

    setSlots((prev) => {
      const next = [...prev];

      if (file) {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current[index] = url;
        next[index] = {
          file,
          previewUrl: url,
          previewType: file.type.startsWith("video/") ? "video" : "image",
        };
      } else {
        const existing = project?.assetPreviews[index];
        next[index] = {
          file: null,
          previewUrl: existing?.url ?? null,
          previewType: existing?.type ?? "image",
        };
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const hasAllAssets = slots.every((slot, i) => slot.file || project?.assets[i]);
    if (!hasAllAssets) {
      setError("Please choose all 4 assets.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Only ever pass through the backend-issued assetId — never construct
      // or guess an S3 URL on the frontend.
      const assetIds = await Promise.all(
        slots.map(async (slot, i) => {
          const existingAssetId = project?.assets[i];

          if (slot.file) {
            const asset = existingAssetId
              ? await replaceAsset(existingAssetId, slot.file)
              : await uploadAsset(slot.file);
            return asset.assetId;
          }

          return existingAssetId ?? "";
        })
      );

      const payload = {
        title: title.trim(),
        description: description.trim(),
        assets: assetIds,
        section,
        isPublished,
        href: href.trim(),
      };

      if (mode === "edit" && project) {
        await updateProject(project.id, payload);
      } else {
        await createProject(payload);
      }

      router.push("/admin/projects");
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
          Section
          <select
            value={section}
            onChange={(event) => setSection(event.target.value as ProjectSection)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
          >
            <option value="one">Section One</option>
            <option value="two">Section Two</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700 lg:self-end lg:pb-2.5">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          Published
        </label>
      </div>

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

      <div className="flex flex-col gap-3">
        <span className="text-sm text-neutral-700">Assets (2x2 grid)</span>

        <div className="grid max-w-md grid-cols-2 gap-4">
          {slots.map((slot, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-xs text-neutral-500">{SLOT_LABELS[i]}</span>

              {slot.previewUrl ? (
                slot.previewType === "video" ? (
                  <video
                    src={slot.previewUrl}
                    muted
                    loop
                    playsInline
                    className="aspect-square w-full rounded-lg bg-neutral-100 object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slot.previewUrl}
                    alt=""
                    className="aspect-square w-full rounded-lg bg-neutral-100 object-cover"
                  />
                )
              ) : (
                <div className="aspect-square w-full rounded-lg bg-neutral-100" />
              )}

              <input
                type="file"
                accept={ASSET_ACCEPT}
                onChange={(event) => handleSlotFileChange(i, event)}
                className="text-xs text-neutral-600"
              />
            </div>
          ))}
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
          {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create project"}
        </button>

        <Link
          href="/admin/projects"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
