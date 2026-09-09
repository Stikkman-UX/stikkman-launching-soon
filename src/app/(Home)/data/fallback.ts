/**
 * Rule 5 helpers: every Home section resolves its CMS content through these,
 * so a missing section, a missing field, or a whole backend outage degrades to
 * the static copy in this folder instead of rendering blank.
 */

import type { CmsButton } from "@/lib/api/types";

export const pickText = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value : fallback;

/**
 * Also the frontend half of the `TestimonialsCarousel` guard — it divides by
 * `testimonials.length`, so an empty array would throw a `RangeError` and take
 * the whole page down. The backend's `.min(1)` is the other half.
 */
export const pickList = <T>(value: T[] | undefined, fallback: T[]): T[] =>
  value && value.length > 0 ? value : fallback;

/**
 * A CMS button falls back as one unit, never field-by-field: a button with a
 * label but no destination (or a destination but no label) is a dead control,
 * which is worse than showing the static one. "Has a destination" means an
 * `href` OR the footer-CTA flag — a footer CTA legitimately has no href.
 */
export const pickButton = (
  value: CmsButton | undefined,
  fallback: CmsButton
): CmsButton =>
  value && value.text?.trim().length > 0 && (value.contactCta || value.href?.length > 0)
    ? value
    : fallback;
