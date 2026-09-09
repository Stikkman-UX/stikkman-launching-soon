/**
 * Navigation-specific descriptor table for the generalized `SectionEditor`
 * (imports the shared field/type vocabulary from `../pages/sectionFields`
 * rather than redefining it — mirrors `../sectors/sectionFields.ts`).
 *
 * Navigation always has exactly these 4 sections, in this fixed order — a
 * flat `Record<NavigationSection, …>`, no parent id/page dimension (it's a
 * singleton, unlike Sectors' board-of-documents).
 */
import type { NavigationSection } from "@/lib/api/types";
import type { ScalarField, SectionField } from "../pages/sectionFields";

export type NavigationSectionDescriptor = {
  label: string;
  fields: SectionField[];
};

// Fixed order mirrors the backend's registry — used to validate the
// `[section]` route param and drive the hub page's link order.
export const NAVIGATION_SECTION_ORDER: NavigationSection[] = [
  "topBarLinks",
  "menuLinks",
  "sectorsDropdown",
  "servicesDropdown",
  "socialLinks",
];

export function isNavigationSection(value: string): value is NavigationSection {
  return (NAVIGATION_SECTION_ORDER as string[]).includes(value);
}

const linkListFields: ScalarField[] = [
  { kind: "text", name: "label", label: "Label" },
  { kind: "text", name: "href", label: "URL" },
];

export const NAVIGATION_SECTIONS: Record<
  NavigationSection,
  NavigationSectionDescriptor
> = {
  topBarLinks: {
    label: "Top Bar Links",
    fields: [
      {
        kind: "objectList",
        name: "items",
        label: "Top bar links",
        itemLabel: "Link",
        fields: linkListFields,
      },
    ],
  },
  menuLinks: {
    label: "Menu Links",
    fields: [
      {
        kind: "objectList",
        name: "items",
        label: "Menu links",
        itemLabel: "Link",
        fields: linkListFields,
      },
    ],
  },
  sectorsDropdown: {
    label: "Sectors Dropdown",
    fields: [
      {
        kind: "objectList",
        name: "items",
        label: "Sectors dropdown",
        itemLabel: "Sector",
        fields: [
          { kind: "image", name: "image", label: "Image" },
          { kind: "text", name: "label", label: "Label" },
          {
            kind: "text",
            name: "href",
            label: "URL (optional — defaults to a 404 page if blank)",
          },
        ],
      },
    ],
  },
  servicesDropdown: {
    label: "Services Dropdown",
    fields: [
      {
        kind: "objectList",
        name: "items",
        label: "Services dropdown",
        itemLabel: "Service",
        fields: [
          { kind: "image", name: "image", label: "Image" },
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "description", label: "Description", rows: 2 },
          {
            kind: "text",
            name: "href",
            label: "URL (optional — defaults to a 404 page if blank)",
          },
        ],
      },
    ],
  },
  socialLinks: {
    label: "Social Links",
    fields: [
      {
        kind: "objectList",
        name: "items",
        label: "Social links",
        itemLabel: "Link",
        fields: linkListFields,
      },
    ],
  },
};
