/**
 * Freezes page scroll while a full-screen overlay is open (the Header menu,
 * the testimonial video lightbox) *without* the layout shifting sideways.
 *
 * The shift this exists to prevent: on desktop browsers that render a classic
 * scrollbar (Windows/Linux Chrome, Firefox, Edge), `overflow: hidden` removes
 * the scrollbar, the layout viewport grows by its width, and everything
 * anchored to the right edge — most visibly the Header's "Menu" button —
 * jumps outward. Reserving that exact width as body padding holds normal-flow
 * content still.
 *
 * Elements positioned against the *viewport* rather than the body (the fixed
 * Header's nav row) can't be held by body padding, so the measured width is
 * also published as the `--scrollbar-width` custom property on <html> for
 * them to offset themselves by. It only exists while a lock is held, so
 * `var(--scrollbar-width, 0px)` is a no-op the rest of the time.
 *
 * Locks are reference-counted: nesting two overlays (or a fade-out that
 * overlaps the next open) still restores exactly once, to the original values.
 */

const SCROLLBAR_WIDTH_VAR = "--scrollbar-width";

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

/** Locks scroll and returns the matching unlock — safe to call more than once. */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (lockCount === 0) {
    const root = document.documentElement;
    const { body } = document;

    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;

    // Measured, not assumed. `innerWidth - clientWidth` is the usual shortcut
    // but it's wrong whenever the page isn't actually scrollable and it can't
    // see a zoom-scaled or overlay scrollbar; comparing the layout viewport
    // before and after the lock reads the real growth instead. That yields 0
    // on overlay-scrollbar platforms (macOS, iOS, Android, Windows 11's
    // overlay mode) and the exact width everywhere else — no UA sniffing, no
    // hardcoded pixel guess. Reading `clientWidth` flushes layout, so the
    // second read already reflects the lock.
    const widthBeforeLock = root.clientWidth;
    body.style.overflow = "hidden";
    const gutter = root.clientWidth - widthBeforeLock;

    if (gutter > 0) {
      body.style.paddingRight = `${gutter}px`;
      root.style.setProperty(SCROLLBAR_WIDTH_VAR, `${gutter}px`);
    }
  }

  lockCount += 1;
  let released = false;

  return function unlockBodyScroll() {
    if (released) return;
    released = true;

    lockCount -= 1;
    if (lockCount > 0) return;

    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
    document.documentElement.style.removeProperty(SCROLLBAR_WIDTH_VAR);
  };
}
