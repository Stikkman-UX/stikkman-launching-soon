/**
 * Every string and date the landing page renders. Mirrors the main site's
 * `(Home)/data/hero.ts` convention: content lives in `data/`, components stay
 * presentational. There is no CMS here, so this file *is* the source of truth
 * — editing it is the whole content workflow.
 */

/**
 * A fixed instant, not a local-midnight calculation: every visitor worldwide
 * counts down to the same moment (midnight IST, 14 Sep 2026) and therefore
 * sees the same number, and the value can't drift with the viewer's timezone.
 */
export const LAUNCH_DATE = new Date("2026-09-14T00:00:00+05:30");

export type HeadingLine = {
  text: string;
  highlight?: boolean;
  /** Cycles through `heroRotatingWords` instead of standing still. */
  rotate?: boolean;
};

/** The resting word on the rotating line, and the first word it cycles to. */
const HERO_FOCUS = "DIGITAL EXPERIENCE";

/**
 * "WE POWER YOUR DIGITAL EXPERIENCE TRANSFORMATION", split across the same
 * three lines the live site's hero uses (`(Home)/data/hero.ts` reads
 * "WE POWER YOUR" / <rotating word> / "TRANSFORMATION") — so the headline
 * lands on the exact rhythm the type ramp was drawn for, with the middle line
 * carrying the highlight the rotating word normally would.
 */
export const headingLines: HeadingLine[] = [
  { text: "WE POWER YOUR" },
  { text: HERO_FOCUS, highlight: true, rotate: true },
  { text: "TRANSFORMATION" },
];

/**
 * Casing is authored here rather than applied with an `uppercase` class, so
 * a sector that ever needs mixed case can just say so.
 *
 * Feeds both the sector row and the hero rotator, so a change lands in both
 * places at once.
 */
export const services = [
  "FINTECH CX",
  "AI PRODUCTS",
  "SAAS EXPERIENCE",
  "ECOMMERCE",
  "HEALTHCARE",
];

/**
 * What the middle heading line cycles through - the same effect the live
 * site uses in its own hero (see (Home)/data/hero.ts there).
 *
 * Derived from `services` rather than restated, so the rotation and the
 * sector row can never drift apart. HERO_FOCUS leads because it is the line
 * at rest: the word rendered in the static markup, and the one a visitor
 * reads before the loop starts.
 */
export const heroRotatingWords = [HERO_FOCUS, ...services];

export const topBar = {
  left: "Client Org. Value $20 Billion",
  center: "BLR . NYC . DXB",
  right: "Dwell . Design . Disrupt",
};

export const eyebrow = "Launching soon";

export type RequestKind = "company-deck" | "request-a-callback";

/**
 * Which body the modal renders:
 *
 * - `email` — the one-field capture, all the deck request needs;
 * - `contact` — the main site's public Contact page form in full (category,
 *   name, email, phone, services, message), so a callback request asks for
 *   exactly what that page asks for.
 */
export type RequestVariant = "email" | "contact";

export type RequestCta = {
  id: RequestKind;
  label: string;
  /** Shown under the modal's title, so each request reads as its own ask. */
  description: string;
  variant: RequestVariant;
  /**
   * Tab this request is appended to in the submissions spreadsheet, and the
   * value the Apps Script switches on to pick both emails. Must match the tab
   * name character for character — see `google-apps-script/README.md`.
   */
  sheet: string;
};

export const requestCtas: Record<"deck" | "caseStudy", RequestCta> = {
  deck: {
    id: "company-deck",
    label: "Request Company Deck",
    description:
      "Drop your email and we'll send the studio deck straight to your inbox.",
    variant: "email",
    sheet: "Company Deck",
  },
  caseStudy: {
    id: "request-a-callback",
    label: "Start A Conversation",
    description:
      "Tell us what you're working on and we'll take it from there — a founder or a design lead will call you back.",
    variant: "contact",
    sheet: "Callback Request",
  },
};

/**
 * The studio's public address. Read by the header's `mailto:` link and by
 * both request forms, which offer it as the fallback when a submission
 * can't reach the sheet.
 */
export const contactEmail = "hello@stikkmanux.com";
