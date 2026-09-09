/**
 * Service-specific descriptor table for the generalized `SectionEditor`
 * (imports the shared field/type vocabulary from `../pages/sectionFields`
 * rather than redefining it — mirrors `../sectors/sectionFields.ts`).
 *
 * Like a sector, a service always has exactly these sections, in this fixed
 * order — a flat `Record<ServiceSection, …>`, no page dimension.
 */
import type { ServiceSection } from "@/lib/api/types";
import type { SectionField } from "../pages/sectionFields";

export type ServiceSectionDescriptor = {
  label: string;
  fields: SectionField[];
};

// Fixed order mirrors the backend's registry (hero/stats/capabilities/
// process/caseStudies/clientsSay/faq) — used to validate the `[section]`
// route param and drives both the admin sidebar and the public page order.
export const SERVICE_SECTION_ORDER: ServiceSection[] = [
  "hero",
  "stats",
  "capabilities",
  "process",
  "caseStudies",
  "clientsSay",
  "faq",
];

export function isServiceSection(value: string): value is ServiceSection {
  return (SERVICE_SECTION_ORDER as string[]).includes(value);
}

export const SERVICE_SECTIONS: Record<ServiceSection, ServiceSectionDescriptor> = {
  hero: {
    label: "Hero",
    fields: [
      // Same shape/descriptor as Home's/About's `headingLines` — cloned
      // verbatim (`../pages/sectionFields.ts`'s `SECTION_FIELDS.home.hero`,
      // `../about-us/sectionFields.ts`'s hero descriptor).
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
      { kind: "textarea", name: "description", label: "Description", rows: 3 },
      { kind: "media", name: "asset", label: "Background asset (image or video)" },
    ],
  },
  stats: {
    label: "Stats",
    fields: [
      {
        kind: "objectList",
        name: "stats",
        label: "Stats",
        itemLabel: "Stat",
        fields: [
          { kind: "text", name: "key", label: "Key" },
          { kind: "text", name: "value", label: "Value" },
        ],
      },
    ],
  },
  capabilities: {
    label: "Capabilities",
    fields: [
      { kind: "text", name: "tagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "capabilities",
        label: "Capabilities",
        itemLabel: "Capability",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
          { kind: "image", name: "asset", label: "Image" },
        ],
      },
    ],
  },
  process: {
    label: "Process",
    fields: [
      { kind: "text", name: "heading", label: "Heading" },
      {
        kind: "objectList",
        name: "steps",
        label: "Steps",
        itemLabel: "Step",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
        ],
      },
    ],
  },
  caseStudies: {
    label: "Case Studies",
    fields: [
      { kind: "text", name: "tagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "caseStudies",
        label: "Case studies",
        itemLabel: "Case study",
        fields: [
          { kind: "image", name: "asset", label: "Image" },
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
          { kind: "text", name: "href", label: "Link (optional)" },
        ],
      },
    ],
  },
  // The only non-array section — flat scalar fields, no `objectList`.
  clientsSay: {
    label: "Clients Say",
    fields: [
      { kind: "textarea", name: "quote", label: "Quote", rows: 4 },
      { kind: "text", name: "quoteBy", label: "Quote by" },
      { kind: "text", name: "designation", label: "Designation" },
    ],
  },
  // Field list copied verbatim from Sector's `closing.faq` descriptor
  // (`../sectors/sectionFields.ts`).
  faq: {
    label: "FAQ",
    fields: [
      {
        kind: "objectList",
        name: "faq",
        label: "FAQ",
        itemLabel: "FAQ item",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
        ],
      },
    ],
  },
};
