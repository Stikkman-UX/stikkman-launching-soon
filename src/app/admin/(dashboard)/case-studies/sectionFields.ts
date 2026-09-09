/**
 * Case-study-specific descriptor table for the generalized `SectionEditor`
 * (imports the shared field/type vocabulary from `../pages/sectionFields`
 * rather than redefining it — one editor, one field-shape language, two
 * descriptor tables).
 *
 * Unlike Home's `SECTION_FIELDS`, this is a flat `Record<CaseStudySection, …>`
 * — a case study always has exactly these sections, in this fixed order, so
 * there's no page dimension to key by.
 */
import type { CaseStudySection } from "@/lib/api/types";
import type { SectionField } from "../pages/sectionFields";

export type CaseStudySectionDescriptor = {
  label: string;
  fields: SectionField[];
};

// Fixed order mirrors the backend's registry (hero/overview/showcase/
// gallery/quote/outcomes/testimonial) — used to validate the `[section]`
// route param. `nextProject` is no longer editable — it's computed
// server-side from the published, order-sorted case-study list.
export const CASE_STUDY_SECTION_ORDER: CaseStudySection[] = [
  "hero",
  "overview",
  "showcase",
  "gallery",
  "quote",
  "outcomes",
  "testimonial",
];

export function isCaseStudySection(value: string): value is CaseStudySection {
  return (CASE_STUDY_SECTION_ORDER as string[]).includes(value);
}

export const CASE_STUDY_SECTIONS: Record<CaseStudySection, CaseStudySectionDescriptor> = {
  hero: {
    label: "Hero",
    fields: [
      { kind: "text", name: "category", label: "Category" },
      { kind: "text", name: "title", label: "Title" },
      { kind: "textarea", name: "aboutClient", label: "About client", rows: 4 },
      { kind: "text", name: "year", label: "Year" },
      { kind: "text", name: "duration", label: "Duration" },
      { kind: "tagList", name: "services", label: "Services (comma separated)" },
      { kind: "media", name: "heroAsset", label: "Hero asset (image or video)" },
    ],
  },
  overview: {
    label: "Overview",
    fields: [
      { kind: "text", name: "heading", label: "Heading" },
      { kind: "textarea", name: "description", label: "Description", rows: 4 },
      { kind: "stringList", name: "points", label: "Points (one per line)" },
    ],
  },
  showcase: {
    label: "Showcase",
    fields: [
      { kind: "text", name: "heading", label: "Heading" },
      { kind: "stringList", name: "description", label: "Description paragraphs (one per line)" },
      {
        kind: "objectList",
        name: "media",
        label: "Media",
        itemLabel: "Item",
        fields: [
          { kind: "media", name: "asset", label: "Asset (image or video)" },
        ],
      },
    ],
  },
  gallery: {
    label: "Gallery",
    fields: [
      {
        kind: "objectList",
        name: "images",
        label: "Images",
        itemLabel: "Image",
        // Reuses `ImageField` unchanged — Gallery is images only, both
        // client-hinted via `accept` and server-enforced.
        fields: [{ kind: "image", name: "asset", label: "Image" }],
      },
    ],
  },
  quote: {
    label: "Quote",
    fields: [{ kind: "textarea", name: "text", label: "Quote text", rows: 4 }],
  },
  outcomes: {
    label: "Outcomes",
    fields: [
      { kind: "text", name: "heading", label: "Heading" },
      {
        kind: "objectList",
        name: "points",
        label: "Outcome points",
        itemLabel: "Point",
        fields: [
          { kind: "text", name: "value", label: "Value" },
          { kind: "text", name: "label", label: "Label" },
        ],
      },
    ],
  },
  testimonial: {
    label: "Testimonial",
    fields: [
      { kind: "textarea", name: "quote", label: "Quote", rows: 4 },
      { kind: "text", name: "author", label: "Author" },
      { kind: "text", name: "role", label: "Role" },
    ],
  },
};
