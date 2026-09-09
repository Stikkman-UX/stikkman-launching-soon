"use client";

import {
  readPath,
  type FieldContext,
  type ObjectListField as ObjectListFieldDescriptor,
} from "../../sectionFields";
import ScalarFieldControl from "./ScalarFields";

const BUTTON_CLASS =
  "rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 disabled:opacity-30";

/**
 * The one repeated array a section is allowed. Order is plain array position
 * persisted on save — no per-move API call, unlike the Projects board.
 */
export default function ObjectListField({
  field,
  ctx,
  onAdd,
  onRemove,
  onMove,
}: {
  field: ObjectListFieldDescriptor;
  ctx: FieldContext;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const value = readPath(ctx.content, field.name);
  const items = Array.isArray(value) ? value : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-700">{field.label}</span>
        <button
          type="button"
          onClick={onAdd}
          disabled={ctx.disabled}
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Add {field.itemLabel.toLowerCase()}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
          No {field.itemLabel.toLowerCase()}s yet.
        </p>
      ) : (
        items.map((_, index) => (
          <fieldset
            key={index}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <legend className="px-1 text-xs uppercase tracking-wide text-neutral-400">
              {field.itemLabel} {index + 1}
            </legend>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0 || ctx.disabled}
                  aria-label={`Move ${field.itemLabel} ${index + 1} up`}
                  className={BUTTON_CLASS}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1 || ctx.disabled}
                  aria-label={`Move ${field.itemLabel} ${index + 1} down`}
                  className={BUTTON_CLASS}
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  disabled={ctx.disabled}
                  aria-label={`Remove ${field.itemLabel} ${index + 1}`}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>

              {field.itemField ? (
                <ScalarFieldControl
                  field={field.itemField}
                  path={`${field.name}.${index}`}
                  ctx={ctx}
                />
              ) : (
                field.fields.map((child) => (
                  <ScalarFieldControl
                    key={child.name}
                    field={child}
                    path={`${field.name}.${index}.${child.name}`}
                    ctx={ctx}
                  />
                ))
              )}
            </div>
          </fieldset>
        ))
      )}
    </div>
  );
}
