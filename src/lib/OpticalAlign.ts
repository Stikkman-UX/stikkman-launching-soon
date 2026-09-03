/**
 * optical-align — per-glyph leading side-bearing trim.
 *
 * A font ships every glyph with a left side bearing (blank space between the
 * pen position and where the ink actually starts). It varies per character, so
 * a heading starting with "A" sits at a visibly different distance from the
 * container edge than one starting with "H" — and neither lines up with an
 * image or rule that starts at 0. This measures that bearing and pulls the
 * element back by exactly that much, so the *ink* meets the edge.
 *
 * Reads the *computed* font of whichever element owns the first glyph, so it
 * works with next/font's hashed family name automatically — no font config
 * needed. The correction is written in `em` (font-size independent) and cached
 * per character × family × weight × style. No side effects on import: call
 * initOpticalAlign() from a client component.
 *
 * Default mode is 'var': JS writes a `--optical-left` custom property per
 * element and your CSS consumes it, so the correction never fights a Tailwind
 * margin utility the way a direct inline `margin-left` write would:
 *
 *   .optical-align { margin-inline-start: var(--optical-left, 0em); }
 *
 * The fallback is deliberately `0em`, not a guessed offset — a guess means the
 * text visibly jumps twice (guess → measured value) instead of once.
 *
 * Scope this to text whose left edge is meant to line up with a container or
 * grid edge — headings, eyebrows, section titles. A negative inline-start
 * margin changes the element's layout width, so applying it to every `<p>`,
 * button label and flex/grid child shifts things that were never misaligned.
 *
 * Multi-line caveat: 'margin' shifts *every* line by the *first* line's
 * first-glyph bearing, which is right for single-line headings and wrong for
 * wrapping body copy. Use 'indent' there — it corrects only the first line.
 */

export type OpticalMode = "margin" | "indent" | "transform" | "var";

export interface OpticalOptions {
  /** Elements to correct. Default: '[data-optical], .optical-align' */
  selector?: string;
  /**
   * How to apply the offset. Default: 'var'.
   *
   * Avoid 'transform' in this app — GSAP animates `transform` on these
   * elements and overwrites it on the first tween.
   */
  mode?: OpticalMode;
  /** Subtree to scan/observe. Default: document.body */
  root?: HTMLElement;
}

export interface OpticalInstance {
  refresh: () => void;
  disconnect: () => void;
}

/**
 * Applied automatically, site-wide. Block-level text containers only — the
 * elements whose left edge is supposed to meet a container or grid edge.
 *
 * Deliberately excludes inline and interactive elements (`a`, `button`,
 * `span`, `li`): they sit inside flex rows and inline flow where a negative
 * inline-start margin shifts a sibling rather than fixing an edge. Opt those
 * in individually with `.optical-align` where it's genuinely wanted.
 *
 * Target the outermost element that owns the font-size, never an inner
 * animation wrapper: `work/[slug]`'s `HeroTitle` nests the text in a
 * `.overflow-hidden` clip mask, so a correction applied inside it would push
 * the leading glyph under the mask and shear it off. Selecting `h1` and
 * measuring the descendant that owns the glyph (see `align`) avoids that.
 */
const DEFAULT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, blockquote, figcaption, dt, dd, " +
  "[data-optical], .optical-align, .optical-align-indent";
const DEFAULT_MODE: OpticalMode = "var";

/** Escape hatch: `data-optical="off"` exempts an element from the auto pass. */
const OPT_OUT = '[data-optical="off"]';

/** Measurement em size. Only sets the float precision — nothing is rasterized. */
const MEAS = 100;
/** Probe value for detecting a canvas font shorthand the browser rejected. */
const FONT_SENTINEL = "10px sans-serif";

const bearingCache = new Map<string, number>();
const lastSig = new WeakMap<Element, string>();
let ctx: CanvasRenderingContext2D | null | undefined;

function getCtx(): CanvasRenderingContext2D | null {
  if (ctx === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    ctx = canvas.getContext("2d");
    if (ctx) ctx.textAlign = "left";
  }
  return ctx;
}

/**
 * Left side bearing of one glyph, as a fraction of the em.
 *
 * `actualBoundingBoxLeft` is the distance from the alignment point *leftward*
 * to the ink's left edge, so its negation is the bearing itself: positive is
 * the normal case (ink starts right of the pen), negative means the glyph
 * overhangs. Nothing is ever drawn — no fillText, no getImageData.
 */
function measure(
  ch: string,
  family: string,
  weight: string,
  style: string,
): number {
  const key = `${ch}|${family}|${weight}|${style}`;
  const hit = bearingCache.get(key);
  if (hit !== undefined) return hit;

  let frac = 0;
  try {
    const c = getCtx();
    if (c) {
      // Canvas silently ignores a font shorthand it can't parse, leaving the
      // previous value in place — which would measure the wrong font and apply
      // a wrong margin to every heading. Assign a sentinel first and confirm
      // the real one displaced it rather than trusting the write.
      c.font = FONT_SENTINEL;
      c.font = `${style} ${weight} ${MEAS}px ${family}`;
      if (c.font !== FONT_SENTINEL) {
        frac = -c.measureText(ch).actualBoundingBoxLeft / MEAS;
      }
    }
  } catch {
    frac = 0;
  }
  if (!Number.isFinite(frac)) frac = 0;

  bearingCache.set(key, frac);
  return frac;
}

/**
 * The first non-whitespace glyph under `root`, *and the element that owns it*.
 *
 * These come as a pair because they can disagree: `HighlightMark` renders a
 * `font-mono` weight-400 `<p>` whose first glyph "/" lives in a nested
 * `<span class="font-bold">` at weight 700. Reading the font off the outer
 * element would measure a bearing the rendered glyph doesn't have.
 */
function firstGlyph(root: HTMLElement): { ch: string; owner: HTMLElement } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const m = (node.nodeValue ?? "").match(/\S/u);
    const owner = node.parentElement;
    if (m && owner) return { ch: m[0], owner };
    node = walker.nextNode();
  }
  return null;
}

function applyValue(el: HTMLElement, frac: number, mode: OpticalMode): void {
  const v = `${(-frac).toFixed(4)}em`;
  switch (mode) {
    case "indent":
      el.style.textIndent = v;
      break;
    case "transform":
      el.style.transform = `translateX(${v})`;
      break;
    case "margin":
      el.style.marginLeft = v;
      break;
    default:
      el.style.setProperty("--optical-left", v);
  }
}

function clearValue(el: HTMLElement, mode: OpticalMode): void {
  switch (mode) {
    case "indent":
      el.style.textIndent = "";
      break;
    case "transform":
      el.style.transform = "";
      break;
    case "margin":
      el.style.marginLeft = "";
      break;
    default:
      el.style.removeProperty("--optical-left");
  }
}

/**
 * Whether shifting this element's box would be correct — and invisible.
 *
 * Running site-wide means meeting elements this was never meant for, so the
 * eligibility test is the load-bearing part, not the measurement.
 */
function eligible(el: HTMLElement, box: CSSStyleDeclaration): boolean {
  if (el.matches(OPT_OUT)) return false;

  // Trims the *leading* edge, so it only applies where that edge is the left
  // edge of the box. On centered or right-aligned text it's a wrong shift.
  const ta = box.textAlign;
  if (box.direction !== "ltr") return false;
  if (ta !== "left" && ta !== "start" && ta !== "justify") return false;

  // An inline box has no meaningful left edge of its own — it starts wherever
  // the previous inline content ended, so a margin there shifts a neighbour.
  if (box.display.startsWith("inline") || box.display === "contents") {
    return false;
  }

  // Nothing here trims ink — it moves the whole border box. That's invisible
  // on plain text and obvious on anything painted: a pill, a card, a bordered
  // callout would slide a few px out of alignment with its neighbours.
  if (box.backgroundImage !== "none") return false;
  if (box.boxShadow !== "none") return false;
  if (parseFloat(box.borderLeftWidth) > 0) return false;
  const bg = box.backgroundColor;
  if (bg && bg !== "transparent" && !/,\s*0\s*\)$/.test(bg)) return false;

  return true;
}

/** Align a single element to its own first glyph. */
export function align(el: HTMLElement, opts: OpticalOptions = {}): void {
  const mode = opts.mode ?? DEFAULT_MODE;
  const glyph = firstGlyph(el);
  if (!glyph) return;

  // Eligibility can change after the fact (a responsive `text-center`, a
  // background added on hover), so undo rather than leave a stale value.
  const box = getComputedStyle(el);
  if (!eligible(el, box)) {
    if (lastSig.has(el)) {
      clearValue(el, mode);
      lastSig.delete(el);
    }
    return;
  }

  const font = glyph.owner === el ? box : getComputedStyle(glyph.owner);
  const sig = `${glyph.ch}|${font.fontFamily}|${font.fontWeight}|${font.fontStyle}|${font.fontSize}|${box.fontSize}|${mode}`;
  if (lastSig.get(el) === sig) return; // unchanged — skip the write
  lastSig.set(el, sig);

  // The bearing is an em of the *glyph's* font, but the correction is written
  // as an em of the *element's* — the two differ when the first glyph sits in
  // a child with its own font-size (a lead-in caps span, a nested small),
  // which would otherwise scale the correction by that ratio.
  const frac = measure(
    glyph.ch,
    font.fontFamily,
    font.fontWeight,
    font.fontStyle,
  );
  const own = parseFloat(box.fontSize);
  const glyphSize = parseFloat(font.fontSize);
  const scale = own > 0 && glyphSize > 0 ? glyphSize / own : 1;

  applyValue(el, frac * scale, mode);
}

/** Align every matching element under the root. */
export function refresh(opts: OpticalOptions = {}): void {
  if (typeof document === "undefined") return;
  const root = opts.root ?? document.body;
  const selector = opts.selector ?? DEFAULT_SELECTOR;
  if (root.matches(selector)) align(root, opts);
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => align(el, opts));
}

/** Start correcting + watching the subtree. Returns handles to refresh/disconnect. */
export function initOpticalAlign(
  options: OpticalOptions = {},
): OpticalInstance {
  if (typeof document === "undefined") {
    return { refresh: () => {}, disconnect: () => {} };
  }

  const opts: Required<OpticalOptions> = {
    selector: options.selector ?? DEFAULT_SELECTOR,
    mode: options.mode ?? DEFAULT_MODE,
    root: options.root ?? document.body,
  };

  const forget = () => {
    bearingCache.clear();
    lastSig.delete(opts.root);
    opts.root
      .querySelectorAll<HTMLElement>(opts.selector)
      .forEach((el) => lastSig.delete(el));
  };

  // Measure against the real webfont, not the `font-display: swap` fallback.
  // A pass before the font lands writes the fallback's bearings, which are
  // then replaced the instant it swaps in — two visible shifts instead of one.
  // The swap already costs a reflow; fold the correction into that same moment.
  //
  // The cache reset is not optional: computed `fontFamily` reads the same
  // before and after the font loads, so any element the MutationObserver
  // aligned while waiting carries a signature that still matches and would be
  // skipped forever, keeping its fallback-measured value.
  if (document.fonts && document.fonts.status !== "loaded") {
    document.fonts.ready.then(() => {
      forget();
      refresh(opts);
    });
  } else {
    refresh(opts);
  }

  // Keep dynamic content correct, batched to one pass per frame.
  let queued = new Set<HTMLElement>();
  let scheduled = false;

  const flush = () => {
    scheduled = false;
    const batch = queued;
    queued = new Set();
    batch.forEach((el) => {
      if (el.isConnected) align(el, opts);
    });
  };

  const enqueue = (el: HTMLElement) => {
    queued.add(el);
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(flush);
    }
  };

  const consider = (node: Node | null) => {
    const start =
      node && node.nodeType === 3
        ? node.parentElement
        : (node as Element | null);
    if (!start || start.nodeType !== 1) return;
    const el = start as HTMLElement;
    const anc = el.closest(opts.selector);
    if (anc) enqueue(anc as HTMLElement);
    el.querySelectorAll(opts.selector).forEach((n) => enqueue(n as HTMLElement));
  };

  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      consider(m.target);
      m.addedNodes.forEach(consider);
    }
  });
  mo.observe(opts.root, {
    subtree: true,
    childList: true,
    characterData: true,
  });

  return {
    refresh: () => refresh(opts),
    disconnect: () => mo.disconnect(),
  };
}
