/**
 * Descriptors driving the generic `SectionEditor`. Every Home section is the
 * same shape — a few scalars, 0–2 CTAs, and at most one array — so one editor
 * plus these tables covers all of them instead of six bespoke forms.
 *
 * Field names are dotted paths into the section's `content` object, so nested
 * scalars (`topBar.left`) and list items (`items.2.avatar`) address uniformly.
 */

export type ListFieldKind = "stringList" | "tagList";

export type ScalarField =
  | { kind: "text"; name: string; label: string; placeholder?: string }
  | { kind: "textarea"; name: string; label: string; rows?: number }
  /** Closed set of string values, rendered as a native `<select>`. */
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
    }
  /** THE standard button: `{ text, color, href, contactCta }`, rendered as one
   *  block of controls. Every admin-managed button on every page uses this —
   *  never hand-roll a button out of separate text/select fields, and never
   *  add a section-local variant. Mirrors the backend's
   *  `controllers/shared/button.ts` and the frontend's `CmsButton` type. */
  | { kind: "button"; name: string; label: string }
  /** Value is an asset id; the preview comes from the `<name>Url` sibling. */
  | { kind: "image"; name: string; label: string }
  /** Image-or-video variant of `image`; the admin read also annotates a
   *  `<name>Type` sibling ("image"|"video") so the saved preview knows which
   *  tag to render. */
  | { kind: "media"; name: string; label: string }
  | { kind: ListFieldKind; name: string; label: string; hint?: string };

export type ObjectListField = {
  kind: "objectList";
  name: string;
  label: string;
  itemLabel: string;
} & (
  | { fields: ScalarField[]; itemField?: never }
  /**
   * The item IS this one field's value rather than an object wrapping named
   * children — used by button lists, where each entry is a whole standard
   * button. Keeps add/remove/reorder identical to any other list.
   */
  | { itemField: ScalarField; fields?: never }
);

export type SectionField = ScalarField | ObjectListField;

/** Everything the field components need, threaded down from `SectionEditor`. */
export type FieldContext = {
  content: Record<string, unknown>;
  /** Raw input buffers for list fields, keyed by path — kept out of `content`
   *  so a trailing separator doesn't disappear mid-keystroke. */
  rawText: Record<string, string>;
  /** Object URLs for images/videos picked but not yet uploaded, keyed by path. */
  previews: Record<string, string>;
  /** Whether the freshly-picked file backing `previews[path]` is a video —
   *  lets `MediaField` choose `<video>` vs `<img>` before upload, when there's
   *  no `<field>Type` sibling from the backend yet. */
  previewIsVideo: Record<string, boolean>;
  disabled: boolean;
  setValue: (path: string, value: unknown) => void;
  setRawList: (path: string, kind: ListFieldKind, raw: string) => void;
  setFile: (path: string, file: File | null) => void;
};

export function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (Array.isArray(value)) return value[Number(key)];
    if (value && typeof value === "object") {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function setIn(container: unknown, keys: string[], value: unknown): unknown {
  const [key, ...rest] = keys;

  if (Array.isArray(container)) {
    const next = [...container];
    const index = Number(key);
    next[index] = rest.length > 0 ? setIn(next[index], rest, value) : value;
    return next;
  }

  const next = { ...(container as Record<string, unknown> | undefined) };
  next[key] = rest.length > 0 ? setIn(next[key], rest, value) : value;
  return next;
}

/** Clone-on-write down the touched path — never mutates `source`. */
export function writePath(
  source: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  return setIn(source, path.split("."), value) as Record<string, unknown>;
}

export function readString(source: unknown, path: string): string {
  const value = readPath(source, path);
  return typeof value === "string" ? value : "";
}

export function formatListValue(kind: ListFieldKind, value: unknown): string {
  const items = Array.isArray(value) ? value.map(String) : [];
  return items.join(kind === "tagList" ? ", " : "\n");
}

/** Same normalisation as `ProjectForm`'s `parseTags`, generalised. */
export function parseListValue(kind: ListFieldKind, raw: string): string[] {
  return raw
    .split(kind === "tagList" ? "," : "\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function emptyValue(field: ScalarField): unknown {
  switch (field.kind) {
    // Colour has to start on a real value — "" isn't one of the two the
    // backend accepts, so a never-touched select would fail validation.
    case "button":
      return { text: "", color: "blue", href: "", contactCta: false };
    // A blank string isn't a valid option, so a new row starts on the first.
    case "select":
      return field.options[0]?.value ?? "";
    case "stringList":
    case "tagList":
      return [];
    default:
      return "";
  }
}

/** Blank row for "Add item". Slugs are derived server-side, never typed. */
export function createEmptyItem(field: ObjectListField): unknown {
  if (field.itemField) return emptyValue(field.itemField);

  const item: Record<string, unknown> = {};

  for (const child of field.fields) {
    item[child.name] = emptyValue(child);
  }

  return item;
}

// Keys and order mirror the backend's page-section registry (and the sidebar
// order in `src/lib/admin/navigation.ts`). Hero is heading lines only; the two
// `projects*Tag` sections carry nothing but the sticky label beside their
// project list, whose cards are their own resource. Insights stays static.
export const SECTION_FIELDS: Record<string, Record<string, SectionField[]>> = {
  home: {
    hero: [
      {
        kind: "objectList",
        name: "headingLines",
        label: "Heading lines",
        itemLabel: "Line",
        fields: [
          { kind: "text", name: "text", label: "Text" },
          {
            kind: "text",
            name: "highlight",
            label: "Highlighted tail (optional)",
          },
        ],
      },
      { kind: "text", name: "topBar.left", label: "Top bar — left" },
      { kind: "text", name: "topBar.center", label: "Top bar — center" },
      { kind: "text", name: "topBar.right", label: "Top bar — right" },
      { kind: "button", name: "primaryCta", label: "Primary button" },
      { kind: "button", name: "secondaryCta", label: "Secondary button" },
    ],
    projectsIntro: [
      { kind: "text", name: "tagName", label: "Tag name" },
      { kind: "textarea", name: "description", label: "Description", rows: 3 },
      { kind: "text", name: "footer", label: "Footer" },
    ],
    projectsOneTag: [{ kind: "text", name: "tagName", label: "Tag name" }],
    whyUs: [
      { kind: "text", name: "tagName", label: "Tag name" },
      { kind: "textarea", name: "mainText", label: "Main text", rows: 4 },
      {
        kind: "objectList",
        name: "points",
        label: "Points",
        itemLabel: "Point",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
        ],
      },
      // A repeatable list of the standard button — each entry is a whole
      // button, so it uses `itemField` rather than re-listing text/colour/
      // link as loose per-item fields (which is what made this section's
      // form differ from Hero's in the first place).
      {
        kind: "objectList",
        name: "buttons",
        label: "Buttons",
        itemLabel: "Button",
        // Label intentionally blank — the list row's own "Button N" legend
        // already names it.
        itemField: { kind: "button", name: "button", label: "" },
      },
    ],
    projectsTwoTag: [{ kind: "text", name: "tagName", label: "Tag name" }],
    capabilities: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      {
        kind: "objectList",
        name: "items",
        label: "Capabilities",
        itemLabel: "Capability",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
          { kind: "tagList", name: "tags", label: "Tags (comma separated)" },
        ],
      },
    ],
    testimonials: [
      {
        kind: "objectList",
        name: "items",
        label: "Testimonials",
        itemLabel: "Testimonial",
        fields: [
          { kind: "textarea", name: "quote", label: "Quote", rows: 3 },
          { kind: "text", name: "author", label: "Author" },
          { kind: "text", name: "role", label: "Role" },
          { kind: "image", name: "avatar", label: "Avatar" },
          { kind: "media", name: "media", label: "Card background (image or video)" },
        ],
      },
    ],
    designDna: [
      { kind: "text", name: "tagName", label: "Tag name" },
      { kind: "textarea", name: "description", label: "Description", rows: 3 },
      { kind: "button", name: "button", label: "Button" },
    ],
    insights: [
      { kind: "text", name: "tagName", label: "Tag name" },
      { kind: "button", name: "button", label: "Button" },
      {
        kind: "objectList",
        name: "items",
        label: "Articles",
        itemLabel: "Article",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "excerpt", label: "Excerpt", rows: 3 },
          { kind: "text", name: "category", label: "Category" },
          { kind: "text", name: "date", label: "Date" },
          { kind: "text", name: "readTime", label: "Read time" },
          { kind: "image", name: "image", label: "Cover image" },
        ],
      },
    ],
  },
  work: {
    header: [
      { kind: "textarea", name: "description", label: "Description", rows: 3 },
    ],
  },
};
