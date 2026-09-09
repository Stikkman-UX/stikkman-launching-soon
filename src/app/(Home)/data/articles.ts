import type { CmsButton } from "@/lib/api/types";
import { COMING_SOON_HREF } from "@/lib/comingSoon";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
};

// Lifted out of `InsightsSection.tsx`; mirrors the backend's `home.insights`
// registry defaults — see the note in `hero.ts`.
export const insightsEyebrow = "INSIGHTS & ARTICLES";
export const insightsCta: CmsButton = {
  text: "All articles",
  color: "white",
  href: COMING_SOON_HREF,
  contactCta: false,
};

export const articles: Article[] = [
  {
    slug: "restraint-in-design-systems",
    title: "Why great design systems are mostly about restraint",
    excerpt:
      "The strongest systems aren't the biggest. We look at how editing down your component library speeds up teams.",
    category: "Design Systems",
    date: "Jun 2026",
    readTime: "6 min",
    image: "/landing/project/image-1.png",
  },
  {
    slug: "five-users-fifty-features",
    title: "Talking to five users beats guessing with fifty features",
    excerpt:
      "A short field note on how lightweight research keeps product teams honest and focused on the real problem.",
    category: "Research",
    date: "May 2026",
    readTime: "4 min",
    image: "/landing/project/image-2.png",
  },
  {
    slug: "motion-with-meaning",
    title: "Motion with meaning: animation as an interface language",
    excerpt:
      "When motion earns its place it guides attention. We break down the timing and easing behind calm interfaces.",
    category: "Craft",
    date: "Apr 2026",
    readTime: "7 min",
    image: "/landing/project/image-3.png",
  },
  {
    slug: "psychology-of-brand",
    title: "The psychology behind memorable brand experiences",
    excerpt:
      "Distinctiveness compounds. A look at how consistent, restrained brand systems build trust over time.",
    category: "Brand",
    date: "Mar 2026",
    readTime: "5 min",
    image: "/landing/project/image-4.png",
  },
];
