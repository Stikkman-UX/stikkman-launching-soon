import type { CmsButton } from "@/lib/api/types";
import { CONTACT_HREF } from "@/lib/contactCta";
import { COMING_SOON_HREF } from "@/lib/comingSoon";

/**
 * Copy that used to be inline in `Hero.tsx`/`HeroHeading.tsx`, lifted out so
 * the section can fall back per-field when the CMS has nothing.
 *
 * Duplicates the backend's `home.hero` registry defaults on purpose — neither
 * app may depend on the other, so this is unavoidable. Drift is cosmetic only.
 *
 * The heading is static content for now (not CMS-driven) — the admin
 * "Heading lines" field still exists but the public page doesn't read it.
 */
export const heroStaticLines = {
  first: "WE POWER YOUR",
  last: "TRANSFORMATION",
};

/**
 * The middle heading line rotates through these, starting on the first one.
 * `HeroHeading` appends a duplicate of the first word to the end of this
 * list to loop the rotation seamlessly in one direction.
 */
export const heroRotatingWords = [
  "DIGITAL EXPERIENCE",
  "FINTECH CX",
  "AI PRODUCT",
  "SAAS EXPERIENCE",
  "ECOMMERCE"
];

export const heroTopBar = {
  left: "Client Org. Value 20 Billion$",
  center: "BLR . NYC . DXB",
  right: "Dwell . Design . Disrupt",
};

// `#contact` is the site-wide opt-in for "scroll to the footer form and focus
// it" (see `lib/contactCta.ts`); `contactCta: true` is the explicit switch
// that actually drives that behaviour (see `shared/Button.tsx`) — `href`
// stays `#contact` too so the two never disagree.
export const heroPrimaryCta: CmsButton = {
  text: "Start a project",
  color: "blue",
  href: CONTACT_HREF,
  contactCta: true,
};

export const heroSecondaryCta: CmsButton = {
  text: "View selected work",
  color: "white",
  href: COMING_SOON_HREF,
  contactCta: false,
};

export const heroBackgroundVideo = "/landing/bg-video.mp4";
