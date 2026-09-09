import ScrollTrigger from "gsap/ScrollTrigger";

/**
 * `ScrollTrigger.refresh()`, held back until the browser has finished
 * restoring the scroll position for the current navigation.
 *
 * Why the gate exists — `refresh()` is not a read-only measurement pass. In
 * `_refreshAll` (gsap/ScrollTrigger.js) it records the current scroll, then
 * **scrolls every scroller to 0** so trigger start/end can be measured with
 * pins reverted, and finally writes the recorded offset back. Two things go
 * wrong if that runs while the browser is still restoring after a reload:
 *
 * 1. The offset it records and restores is the *un-restored* one — normally
 *    0 — so the page is put back at the top rather than where it was.
 * 2. Any scroll write inside GSAP's 500ms startup window force-sets
 *    `history.scrollRestoration = "manual"` (gsap/Observer.js), deliberately,
 *    so the browser can't override GSAP's own restore. That permanently
 *    cancels the pending restoration for this navigation, so the browser
 *    never gets a second try.
 *
 * The trigger was `SmoothScroll`'s content-height `ResizeObserver`:
 * ResizeObserver always fires once immediately on `observe()`, so its
 * debounced refresh landed ~100ms after mount — inside the startup window and
 * before restoration had happened. Hence "reloads mostly jump to the top",
 * intermittent because a warm cache sometimes lets the browser restore first.
 *
 * Deferring to `load` fixes both: by then restoration is settled, so the
 * offset `refresh()` records and puts back is the correct one. GSAP resets
 * `history.scrollRestoration` to its captured value at the end of every
 * `_refreshAll` (`_clearScrollMemory`), so nothing stays latched to "manual"
 * for the next reload.
 *
 * Refreshes requested before `load` are coalesced into a single one that runs
 * on `load`; after `load` this is a plain pass-through.
 */
let isRefreshQueued = false;

export function refreshScrollTriggers() {
  if (typeof window === "undefined") return;

  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
    return;
  }

  if (isRefreshQueued) return;
  isRefreshQueued = true;

  window.addEventListener(
    "load",
    () => {
      isRefreshQueued = false;
      ScrollTrigger.refresh();
    },
    { once: true },
  );
}
