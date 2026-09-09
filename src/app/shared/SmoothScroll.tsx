"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { setLenisInstance } from "@/lib/smoothScroll";
import { refreshScrollTriggers } from "@/lib/scrollRefresh";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 1.7,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Lenis only recalculates its scrollable limit on window resize, so a
    // section that changes height on its own (accordion, tab, async content)
    // leaves it scrolling against a stale limit until a native scrollbar
    // drag forces a resync. Watch the document for content-height changes
    // and resync Lenis + ScrollTrigger whenever they happen.
    //
    // Must observe `document.body`, not `document.documentElement`: `<html>`
    // has `h-full` (`height: 100%`), which pins its box to the viewport
    // height regardless of content — a growing section only changes its
    // `scrollHeight`, which ResizeObserver doesn't report, so it would never
    // fire. `<body>` only has `min-h-full` (`min-height: 100%`, auto beyond
    // that), so its box genuinely grows/shrinks with content and actually
    // triggers the callback.
    //
    // `lenis.resize()` is safe to run on every change — it only *reads* the
    // scroll position. The ScrollTrigger resync goes through
    // `refreshScrollTriggers()` instead of `ScrollTrigger.refresh()` because
    // that one *writes* scroll, which fights the browser's scroll restoration
    // on reload; see the comment on that helper.
    let refreshTimeout: number;
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(refreshScrollTriggers, 100);
    });
    resizeObserver.observe(document.body);

    return () => {
      window.clearTimeout(refreshTimeout);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      gsap.ticker.remove(update);
    };
  }, []);

  // Next.js swaps `children` in place on client-side navigation — no full
  // remount of this component, so the Lenis instance above persists across
  // routes. The router resets the *native* scroll position to 0, but Lenis
  // keeps its own internally tracked scroll target, which doesn't know that
  // happened; it keeps chasing the stale value against the new page's
  // (usually different) scrollable height. That desync is what reads as the
  // scroll being "stuck" after switching to a section with more scrollable
  // area — Lenis has to fight through the gap between where it thinks it is
  // and where the page actually is before scrolling visibly responds again.
  // Resync explicitly on every route change instead of waiting for a manual
  // scrollbar drag (or nothing) to fix it. Skip the very first run so a hard
  // reload deep in a page doesn't get yanked to the top.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.resize();
    lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
