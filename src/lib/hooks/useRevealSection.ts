"use client";

import { useEffect, useRef } from "react";
import { refreshScrollTriggers } from "@/lib/scrollRefresh";

// Must match the transition duration on `.reveal-section` in globals.css.
const REVEAL_DURATION_MS = 800;

/**
 * Ref to pair with the `.reveal-section` class in globals.css (apply the
 * class in JSX so the element starts hidden even before this effect runs).
 * Adds `.is-visible` the first time the element enters the viewport, then —
 * once the transition finishes — strips both classes back off entirely.
 *
 * That cleanup matters: `.is-visible`'s resting `transform: translateY(0)`
 * is still a transform value other than `none`, so it creates a new CSS
 * containing block for as long as it's applied. Left in place, that
 * permanently breaks `position: sticky` descendants, and on sections GSAP
 * also drives via its own transform (pin/scrub), the lingering CSS
 * `transition: transform` fights GSAP's per-frame updates. Removing the
 * classes after the one-time reveal avoids both, so this hook is safe to
 * use on any section root, sticky-containing or GSAP-animated, uniformly.
 */
export function useRevealSection<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);

        el.classList.add("is-visible");
        window.setTimeout(() => {
          el.classList.remove("reveal-section", "is-visible");
          // Any GSAP ScrollTrigger anchored to this element (or measuring
          // past it) may have cached start/end positions while the reveal
          // transform was still applied; resync now that it's gone. Gated on
          // `load` so it can't clobber the browser's scroll restoration on a
          // reload — sections already in view reveal immediately on mount,
          // which on a slow page fires this well before restoration settles.
          refreshScrollTriggers();
        }, REVEAL_DURATION_MS);
      },
      // threshold: 0 fires as soon as a single pixel crosses into the
      // (shrunk) root, i.e. once the element's top reaches ~85% down the
      // viewport — independent of the element's own height. A percentage
      // threshold like 0.15 requires that fraction of the *target's total
      // area* to be visible, which is fine for a short section but on a
      // tall one (e.g. ShowcaseSection's sticky-left/long-scroll-right
      // layout can run several viewport heights) it stays unmet until deep
      // into the section, leaving it blank on screen for a long stretch.
      { threshold: 0.05, rootMargin: "0px 0px -15% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
