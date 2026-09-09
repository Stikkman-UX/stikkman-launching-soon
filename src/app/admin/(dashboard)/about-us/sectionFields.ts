/**
 * About Us-specific descriptor table for the generalized `SectionEditor`
 * (imports the shared field/type vocabulary from `../pages/sectionFields`
 * rather than redefining it — mirrors `../navigation/sectionFields.ts`).
 *
 * About Us always has exactly these 7 sections, in this fixed order — a flat
 * `Record<AboutUsSection, …>`, no parent id (it's a singleton, same as
 * Navigation, unlike Sectors' board-of-documents).
 */
import type { AboutUsSection } from "@/lib/api/types";
import type { SectionField } from "../pages/sectionFields";

export type AboutUsSectionDescriptor = {
  label: string;
  fields: SectionField[];
};

// Fixed order mirrors the backend's registry — used to validate the
// `[section]` route param and drive the hub page's link order.
export const ABOUT_US_SECTION_ORDER: AboutUsSection[] = [
  "hero",
  "stats",
  "companyHighlight",
  "whatWeServe",
  "process",
  "solutions",
  "team",
];

export function isAboutUsSection(value: string): value is AboutUsSection {
  return (ABOUT_US_SECTION_ORDER as string[]).includes(value);
}

export const ABOUT_US_SECTIONS: Record<AboutUsSection, AboutUsSectionDescriptor> = {
  hero: {
    label: "Hero",
    fields: [
      {
        kind: "objectList",
        name: "headingLines",
        label: "Heading lines",
        itemLabel: "Line",
        fields: [
          { kind: "text", name: "text", label: "Text" },
          { kind: "text", name: "highlight", label: "Highlighted tail (optional)" },
        ],
      },
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
          { kind: "text", name: "value", label: 'Value (e.g. "40+")' },
          { kind: "text", name: "label", label: "Label" },
        ],
      },
    ],
  },
  companyHighlight: {
    label: "Company Highlight",
    fields: [
      { kind: "text", name: "heading", label: "Heading" },
      {
        kind: "stringList",
        name: "descriptions",
        label: "Descriptions (one per line)",
      },
    ],
  },
  whatWeServe: {
    label: "What We Serve",
    fields: [
      { kind: "text", name: "tagName", label: "Tag name" },
      { kind: "textarea", name: "description", label: "Description", rows: 3 },
      {
        kind: "objectList",
        name: "items",
        label: "Items",
        itemLabel: "Item",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
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
  solutions: {
    label: "Solutions",
    fields: [
      { kind: "text", name: "tagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "items",
        label: "Solutions",
        itemLabel: "Solution",
        fields: [
          { kind: "media", name: "asset", label: "Asset (image or video)" },
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
        ],
      },
    ],
  },
  team: {
    label: "Team",
    fields: [
      { kind: "text", name: "tagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "members",
        label: "Team members",
        itemLabel: "Member",
        fields: [
          { kind: "image", name: "profileImage", label: "Profile image" },
          { kind: "text", name: "name", label: "Name" },
          { kind: "text", name: "designation", label: "Designation" },
          { kind: "text", name: "linkedIn", label: "LinkedIn (optional)" },
        ],
      },
    ],
  },
};
