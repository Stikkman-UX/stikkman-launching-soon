import type { CmsButton } from "@/lib/api/types";
import { COMING_SOON_HREF } from "@/lib/comingSoon";

export const designPrinciples: string[] = [
  "Clarity over cleverness",
  "Details compound",
  "Research before pixels",
  "Motion with meaning",
  "Ship, then refine",
];

// Rule 5 fallback copy for the CMS `designDna` section. `principles` (the
// marquee) is deliberately not CMS-backed and stays static.
export const designDna = {
  eyebrow: "DESIGN DNA",
  statement:
    "Good design goes unnoticed. We obsess over the seams so the people using our work never have to think about them.",
  cta: {
    text: "See how we work",
    color: "blue",
    href: COMING_SOON_HREF,
    contactCta: false,
  } satisfies CmsButton,
  principles: designPrinciples,
};
