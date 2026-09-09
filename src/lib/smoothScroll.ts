import type Lenis from "lenis";

// `SmoothScroll.tsx` mounts a single Lenis instance at the root layout and
// registers it here so any client component can drive a scroll through it
// without prop-drilling — a plain module-level singleton rather than a
// context, since there's only ever one instance for the whole app. Scrolling
// through Lenis (instead of native `scrollIntoView`) matters: Lenis owns an
// internally tracked scroll target it animates toward every frame, and a
// native scroll call outside that would desync from it, same reasoning as
// the route-change resync in `SmoothScroll.tsx`.
let instance: Lenis | null = null;

export function setLenisInstance(lenis: Lenis | null) {
  instance = lenis;
}

export function scrollToElement(
  target: HTMLElement,
  options?: { offset?: number; onComplete?: () => void },
) {
  const { offset = 0, onComplete } = options ?? {};

  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.2, onComplete });
    return;
  }

  target.scrollIntoView({ behavior: "smooth" });
  // The native path has no completion signal — `scrollend` still isn't in
  // Safari — so approximate it, rather than leaving callers without their
  // callback on the one path where Lenis hasn't mounted yet.
  if (onComplete) window.setTimeout(onComplete, 700);
}
