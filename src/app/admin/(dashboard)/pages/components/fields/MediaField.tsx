"use client";

import type { ChangeEvent } from "react";
import { ASSET_ACCEPT } from "@/lib/constants";
import {
  readString,
  type FieldContext,
  type ScalarField,
} from "../../sectionFields";

/**
 * Image-or-video sibling of `ImageField`: same pick-preview-upload-on-submit
 * UX, but accepts video too and branches the preview tag accordingly. A
 * freshly picked file is typed via `ctx.previewIsVideo`; an already-saved
 * asset is typed via the `<field>Type` sibling the admin read annotates onto
 * every media-bearing field.
 */
export default function MediaField({
  field,
  path,
  ctx,
}: {
  field: ScalarField;
  path: string;
  ctx: FieldContext;
}) {
  const previewUrl = ctx.previews[path] ?? readString(ctx.content, `${path}Url`);
  const isVideo = Object.prototype.hasOwnProperty.call(ctx.previews, path)
    ? (ctx.previewIsVideo[path] ?? false)
    : readString(ctx.content, `${path}Type`) === "video";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    ctx.setFile(path, event.target.files?.[0] ?? null);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-neutral-700">{field.label}</span>

      {previewUrl ? (
        isVideo ? (
          // Admin-only preview of an arbitrary S3 URL — same reasoning as
          // the `<img>` branch below.
          <video
            src={previewUrl}
            muted
            loop
            playsInline
            className="aspect-4/3 w-full max-w-xs rounded-lg object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="aspect-4/3 w-full max-w-xs rounded-lg object-cover"
          />
        )
      ) : null}

      <input
        type="file"
        accept={ASSET_ACCEPT}
        disabled={ctx.disabled}
        onChange={handleChange}
        className="text-sm text-neutral-600"
      />
    </div>
  );
}
