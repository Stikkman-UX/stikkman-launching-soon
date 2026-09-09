/**
 * Sector-specific descriptor table for the generalized `SectionEditor`
 * (imports the shared field/type vocabulary from `../pages/sectionFields`
 * rather than redefining it — mirrors `../case-studies/sectionFields.ts`).
 *
 * Like a case study, a sector always has exactly these sections, in this
 * fixed order — a flat `Record<SectorSection, …>`, no page dimension.
 */
import type { SectorSection } from "@/lib/api/types";
import type { SectionField } from "../pages/sectionFields";

export type SectorSectionDescriptor = {
  label: string;
  fields: SectionField[];
};

// Fixed order mirrors the backend's registry (overview/metrics/projects/
// whyUs/specialized/industryExperts/services/capabilities/testimonials/
// closing) — used to validate the `[section]` route param.
export const SECTOR_SECTION_ORDER: SectorSection[] = [
  "overview",
  "metrics",
  "projects",
  "whyUs",
  "specialized",
  "industryExperts",
  "services",
  "capabilities",
  "testimonials",
  "closing",
];

export function isSectorSection(value: string): value is SectorSection {
  return (SECTOR_SECTION_ORDER as string[]).includes(value);
}

export const SECTOR_SECTIONS: Record<SectorSection, SectorSectionDescriptor> = {
  overview: {
    label: "Overview",
    fields: [
      { kind: "textarea", name: "about", label: "About", rows: 4 },
      // The shared field system (`SectionField` = `ScalarField |
      // ObjectListField` in `../pages/sectionFields.ts`) has no "nested
      // object group" kind — only plain scalars and repeatable lists — so
      // `domainExpert: { name, description, linkedIn }` is flattened to
      // three top-level content keys instead of dotted `domainExpert.*`
      // paths under a group.
      { kind: "image", name: "domainExpertImage", label: "Domain expert photo" },
      { kind: "text", name: "domainExpertName", label: "Domain expert name" },
      {
        kind: "textarea",
        name: "domainExpertDescription",
        label: "Domain expert description",
        rows: 3,
      },
      { kind: "text", name: "domainExpertLinkedIn", label: "Domain expert LinkedIn" },
    ],
  },
  metrics: {
    label: "Metrics",
    fields: [
      {
        kind: "objectList",
        name: "metrics",
        label: "Metrics",
        itemLabel: "Metric",
        fields: [
          { kind: "text", name: "metric", label: "Metric" },
          { kind: "text", name: "value", label: "Value" },
        ],
      },
    ],
  },
  projects: {
    label: "Projects",
    fields: [
      { kind: "text", name: "projectsTagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "projects",
        label: "Projects",
        itemLabel: "Project",
        fields: [
          { kind: "text", name: "projectName", label: "Project name" },
          { kind: "media", name: "asset", label: "Asset (image or video)" },
          { kind: "text", name: "href", label: "Link (optional)" },
        ],
      },
    ],
  },
  whyUs: {
    label: "Why Us",
    fields: [
      { kind: "text", name: "whyUsTagName", label: "Tag name" },
      { kind: "text", name: "heading", label: "Heading" },
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
    ],
  },
  specialized: {
    label: "Specialized",
    fields: [
      { kind: "text", name: "specializedTagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "specialized",
        label: "Specialized",
        itemLabel: "Item",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 4 },
          { kind: "stringList", name: "bulletPoints", label: "Bullet points (one per line)" },
        ],
      },
    ],
  },
  industryExperts: {
    label: "Industry Experts",
    fields: [
      { kind: "text", name: "industryExpertsTagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "profiles",
        label: "Profiles",
        itemLabel: "Profile",
        fields: [
          { kind: "image", name: "profileImage", label: "Profile image" },
          { kind: "text", name: "name", label: "Name" },
          { kind: "text", name: "designation", label: "Designation" },
          { kind: "text", name: "expertise", label: "Expertise" },
          { kind: "text", name: "linkedIn", label: "LinkedIn (optional)" },
        ],
      },
    ],
  },
  services: {
    label: "Services",
    fields: [
      { kind: "text", name: "servicesTagName", label: "Tag name" },
      {
        kind: "objectList",
        name: "services",
        label: "Services",
        itemLabel: "Service",
        fields: [
          { kind: "image", name: "imageAsset", label: "Image" },
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
        ],
      },
    ],
  },
  capabilities: {
    label: "Capabilities",
    fields: [
      { kind: "text", name: "capabilitiesTagName", label: "Tag name" },
      { kind: "text", name: "heading", label: "Heading" },
      {
        kind: "objectList",
        name: "options",
        label: "Options",
        itemLabel: "Option",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 3 },
        ],
      },
    ],
  },
  // Field list copied verbatim from Home's testimonials descriptor
  // (`../pages/sectionFields.ts`'s `SECTION_FIELDS.home.testimonials`).
  testimonials: {
    label: "Testimonials",
    fields: [
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
  },
  closing: {
    label: "Closing",
    fields: [
      { kind: "textarea", name: "foundersSay", label: "Founders say", rows: 4 },
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
