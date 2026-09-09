export type ProjectAsset = {
  url: string;
  type: "image" | "video";
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  /** Always exactly 4, in 2x2 grid order: top-left, top-right, bottom-left, bottom-right. */
  assets: ProjectAsset[];
  /** Falls back to `/404` in `ProjectCard` if unset. */
  href?: string;
};

const STATIC_IMAGES = [
  "/landing/project/image-1.png",
  "/landing/project/image-2.png",
  "/landing/project/image-3.png",
  "/landing/project/image-4.png",
];

/** Cycles through the 4 static images starting at `offset` so every project
 *  gets a full 2x2 grid worth of (static, image-only) fallback assets. */
function staticAssets(offset: number): ProjectAsset[] {
  return Array.from({ length: 4 }, (_, i) => ({
    url: STATIC_IMAGES[(offset + i) % STATIC_IMAGES.length],
    type: "image" as const,
  }));
}

export const projectsPartOne: Project[] = [
  {
    slug: "divine-five",
    title: "Divine Five",
    description:
      "An internal operating system for a fast-scaling infra team, built for speed and clarity.",
    assets: staticAssets(0),
  },
  {
    slug: "north-star",
    title: "North Star",
    description:
      "A design system and component library that unified product across four platforms.",
    assets: staticAssets(1),
  },
  {
    slug: "atlas-crm",
    title: "Atlas CRM",
    description:
      "A ground-up redesign of a legacy CRM, cutting onboarding time by half.",
    assets: staticAssets(2),
  },
];

export const projectsPartTwo: Project[] = [
  {
    slug: "lumen-analytics",
    title: "Lumen Analytics",
    description:
      "A data visualization suite that turned dense reporting into a story teams could actually act on.",
    assets: staticAssets(3),
  },
  {
    slug: "porter-mobile",
    title: "Porter Mobile",
    description:
      "A logistics app redesign that cut driver onboarding time from a week to a single afternoon.",
    assets: staticAssets(0),
  },
  {
    slug: "solace-wellness",
    title: "Solace Wellness",
    description:
      "A calm, accessible brand and product system for a mental health platform used by thousands weekly.",
    assets: staticAssets(1),
  },
];
