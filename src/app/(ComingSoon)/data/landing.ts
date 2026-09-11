/**
 * Every string and date the landing page renders. Mirrors the main site's
 * `(Home)/data/hero.ts` convention: content lives in `data/`, components stay
 * presentational. There is no CMS here, so this file *is* the source of truth
 * — editing it is the whole content workflow.
 */

/**
 * A fixed instant, not a local-midnight calculation: every visitor worldwide
 * counts down to the same moment (midnight IST, 18 Sep 2026) and therefore
 * sees the same number, and the value can't drift with the viewer's timezone.
 */
export const LAUNCH_DATE = new Date("2026-09-18T00:00:00+05:30");

/**
 * The same instant as a label, pinned to IST so the server and the client
 * print the identical string (a `toLocaleDateString()` in the viewer's zone
 * could roll it to the 17th west of Greenwich and fail hydration).
 */
export const launchDateLabel = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
}).format(LAUNCH_DATE);

// --- `/coming-soon` holding page ---------------------------------------------
//
// Its own copy, deliberately unlike the landing page's hero statement: this is
// where an unbuilt link lands, and it should read as "not here yet", not as
// the front door again.

/** Two lines; the second is set in the accent colour. */
export const holdingHeading = ["A new experience", "is taking shape."] as const;

/** The line under the headline — what a visitor can do while the site holds. */
export const intro =
  "We're putting the finishing touches on the next chapter of Stikkman UX. Until it lands, the studio deck is one email away.";

/** Under the inline deck form. */
export const deckNote = "No spam. One email with the deck, and nothing else.";

/**
 * The small tilted cards floating at the corners of the holding page — the
 * studio's numbers as at-a-glance widgets. Every figure here is one the site
 * already states elsewhere (the meta bar, the SEO description), restated
 * rather than invented.
 */
export const floatingCards = {
  lives: { label: "Lives touched", value: "100M+", tag: "To date" },
  clients: { label: "Client org. value", value: "$20B", tag: "Portfolio" },
  studios: { label: "Studios", value: "BLR · NYC · DXB", tag: "3 cities" },
  site: { label: "New website", value: "In the works", tag: "Launching" },
} as const;

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

/**
 * The client logos in the landing hero's carousel.
 *
 * The files live in `public/logo carousel/` — the space is why every `src`
 * below is written with `%20`. A browser would encode it anyway, but spelling
 * it out means the string in the markup is the string that gets requested,
 * which is one less thing to wonder about if a host ever serves this
 * directory differently.
 *
 * `name` is the image's alt text, so it wants the brand as a person would
 * read it aloud. Adding a logo is a file plus a line here — nothing in
 * `LogoCarousel` has to change. Every one is drawn at a single fixed height
 * with `w-auto`, so mixed aspect ratios line up; what does matter is that a
 * file's artwork fills its own box (no baked-in padding), or that mark will
 * look smaller than its neighbours at the same height.
 *
 * Every mark is `.svg`, but only one of them is really a vector. The other
 * ten are Figma exports of a placed bitmap, which is a single `<image>` of
 * base64 PNG inside a `<pattern>` — so they scale to any pixel density (the
 * embedded bitmaps run up to 4096px wide against a ~30px render, where the
 * old 40px-tall PNGs went soft on a retina phone) while still costing what
 * a bitmap costs: ~3.3MB across those ten, against ~80KB for the `.png`
 * copies still sitting beside them.
 *
 * `logo11.svg` is what the rest should look like: nine `<path>`s, no
 * embedded raster, 5.6KB — smaller than its own PNG and sharp at every
 * density. Re-exporting the others that way is the fix if this strip ever
 * has to get lighter; hand-optimising the bitmap-bearing ones is not.
 */
export const heroLogos: { name: string; src: string }[] = [
  { name: "Garuda Aerospace", src: "/logo%20carousel/logo1.svg" },
  { name: "InsuranceDekho", src: "/logo%20carousel/logo2.svg" },
  { name: "BBT", src: "/logo%20carousel/logo3.svg" },
  { name: "Dowell's", src: "/logo%20carousel/logo4.svg" },
  // The only mark I couldn't read with confidence — a square icon with no
  // wordmark. Correct the name and the alt text is fixed.
  { name: "Client logo", src: "/logo%20carousel/logo5.svg" },
  { name: "SFC", src: "/logo%20carousel/logo6.svg" },
  { name: "Bharat Parenterals Limited", src: "/logo%20carousel/logo7.svg" },
  { name: "Apothecon", src: "/logo%20carousel/logo8.svg" },
  { name: "Ratnaafin", src: "/logo%20carousel/logo9.svg" },
  { name: "Asian Cables", src: "/logo%20carousel/logo10.svg" },
  // The only true vector file of the set — see the note above.
  { name: "PhillipCapital", src: "/logo%20carousel/logo11.svg" },
];

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
