"use client";

import {
  formatListValue,
  readPath,
  readString,
  type FieldContext,
  type ScalarField,
} from "../../sectionFields";
import ImageField from "./ImageField";
import MediaField from "./MediaField";

export const INPUT_CLASS =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 disabled:opacity-50";

const LABEL_CLASS = "flex flex-col gap-2 text-sm text-neutral-700";

/** Renders one scalar descriptor at an absolute dotted path into `content`. */
export default function ScalarFieldControl({
  field,
  path,
  ctx,
}: {
  field: ScalarField;
  path: string;
  ctx: FieldContext;
}) {
  switch (field.kind) {
    case "textarea":
      return (
        <label className={LABEL_CLASS}>
          {field.label}
          <textarea
            rows={field.rows ?? 4}
            value={readString(ctx.content, path)}
            disabled={ctx.disabled}
            onChange={(event) => ctx.setValue(path, event.target.value)}
            className={`${INPUT_CLASS} resize-none`}
          />
        </label>
      );

    case "select":
      return (
        <label className={LABEL_CLASS}>
          {field.label}
          <select
            value={readString(ctx.content, path)}
            disabled={ctx.disabled}
            onChange={(event) => ctx.setValue(path, event.target.value)}
            className={INPUT_CLASS}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );

    // THE standard button control — text, colour, link, footer-CTA — used by
    // every managed button on every page. A footer CTA never renders as a
    // real link (`Button`'s `isContactCta` short-circuits it) and the backend
    // doesn't require `href` for one, so the link input is disabled rather
    // than inviting a URL that would never be used.
    case "button": {
      const isContactCta = Boolean(readPath(ctx.content, `${path}.contactCta`));

      return (
        <fieldset className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-4">
          {/* Empty label = this button IS a list item (see `itemField`), whose
              row already carries a "Button N" legend — a second one would just
              repeat it. */}
          {field.label ? (
            <legend className="px-1 text-xs uppercase tracking-wide text-neutral-400">
              {field.label}
            </legend>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <label className={LABEL_CLASS}>
              Text
              <input
                type="text"
                value={readString(ctx.content, `${path}.text`)}
                disabled={ctx.disabled}
                onChange={(event) =>
                  ctx.setValue(`${path}.text`, event.target.value)
                }
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              Color
              <select
                value={readString(ctx.content, `${path}.color`) || "blue"}
                disabled={ctx.disabled}
                onChange={(event) =>
                  ctx.setValue(`${path}.color`, event.target.value)
                }
                className={INPUT_CLASS}
              >
                <option value="blue">Blue</option>
                <option value="white">White</option>
              </select>
            </label>
          </div>

          <label className={LABEL_CLASS}>
            Link
            <input
              type="text"
              value={readString(ctx.content, `${path}.href`)}
              disabled={ctx.disabled || isContactCta}
              placeholder={
                isContactCta
                  ? "Not needed — scrolls to the footer contact form"
                  : undefined
              }
              onChange={(event) =>
                ctx.setValue(`${path}.href`, event.target.value)
              }
              className={INPUT_CLASS}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isContactCta}
              disabled={ctx.disabled}
              onChange={(event) =>
                ctx.setValue(`${path}.contactCta`, event.target.checked)
              }
            />
            Use as footer CTA — scrolls to the contact form instead of a link
          </label>
        </fieldset>
      );
    }

    case "stringList":
    case "tagList": {
      // One line / one comma-separated entry beats eight add-remove rows for
      // the marquee and principles lists.
      const raw =
        ctx.rawText[path] ??
        formatListValue(field.kind, readPath(ctx.content, path));

      return (
        <label className={LABEL_CLASS}>
          {field.label}
          {field.kind === "stringList" ? (
            <textarea
              rows={6}
              value={raw}
              disabled={ctx.disabled}
              onChange={(event) =>
                ctx.setRawList(path, field.kind, event.target.value)
              }
              className={`${INPUT_CLASS} resize-none`}
            />
          ) : (
            <input
              type="text"
              value={raw}
              disabled={ctx.disabled}
              onChange={(event) =>
                ctx.setRawList(path, field.kind, event.target.value)
              }
              className={INPUT_CLASS}
            />
          )}
          {field.hint ? (
            <span className="text-xs text-neutral-400">{field.hint}</span>
          ) : null}
        </label>
      );
    }

    case "image":
      return <ImageField field={field} path={path} ctx={ctx} />;

    case "media":
      return <MediaField field={field} path={path} ctx={ctx} />;

    default:
      return (
        <label className={LABEL_CLASS}>
          {field.label}
          <input
            type="text"
            value={readString(ctx.content, path)}
            placeholder={field.placeholder}
            disabled={ctx.disabled}
            onChange={(event) => ctx.setValue(path, event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
      );
  }
}
