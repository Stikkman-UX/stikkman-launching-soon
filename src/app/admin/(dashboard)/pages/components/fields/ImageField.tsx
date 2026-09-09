"use client";

import type { ChangeEvent } from "react";
import {
  readString,
  type FieldContext,
  type ScalarField,
} from "../../sectionFields";

/**
 * Same upload UX as `ProjectForm`: pick a file, preview it immediately from an
 * object URL, and only send it to the backend on submit. The stored value is
 * always the backend-issued asset id — never a constructed S3 URL.
 */
export default function ImageField({
  field,
  path,
  ctx,
}: {
  field: ScalarField;
  path: string;
  ctx: FieldContext;
}) {
  // The admin read annotates every asset field with a resolved `<field>Url`
  // sibling; a freshly picked file shadows it with a local object URL.
  const previewUrl = ctx.previews[path] ?? readString(ctx.content, `${path}Url`);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    ctx.setFile(path, event.target.files?.[0] ?? null);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-neutral-700">{field.label}</span>

      {previewUrl ? (
        // Admin-only preview of an arbitrary S3 URL — next/image would need a
        // remotePatterns allowlist for a domain we don't control here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className="aspect-4/3 w-full max-w-xs rounded-lg object-cover"
        />
      ) : null}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={ctx.disabled}
        onChange={handleChange}
        className="text-sm text-neutral-600"
      />
    </div>
  );
}
