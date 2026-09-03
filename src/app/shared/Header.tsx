"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { contactEmail } from "@/app/(ComingSoon)/data/landing";

/**
 * Height of the collapsed bar, in px.
 *
 * Mirrors `--spacing-bar` in globals.css — `max(54px, 3.75vw)`. GSAP tweens a
 * numeric height, so it needs the resolved value rather than the CSS token,
 * and the two have to be changed together. Everything else inside the bar is
 * sized off the token in CSS, so this is the only place the formula is
 * repeated.
 */
function barHeight() {
  return Math.max(54, window.innerWidth * 0.0375);
}

/**
 * The site's loading animation, ported from the main site's
 * `stikkman-revamp/src/app/shared/Header.tsx`.
 *
 * There is no separate preloader component anywhere in that codebase — the
 * header is it: this element renders at `h-dvh` (a full-viewport violet
 * splash) and a GSAP timeline collapses it to the bar on mount while the logo
 * and each wordmark character drop in from the vertical centre of the
 * viewport.
 *
 * Trimmed for this app: no menu overlay, no services dropdown, no case-study
 * nav, and no scroll-driven wordmark fade — the landing page is a single
 * `h-dvh` viewport with nothing to scroll, so `ScrollTrigger` is not
 * registered here at all. The intro timeline itself is unchanged.
 */
export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const lockup = lockupRef.current;
    if (!header || !lockup) return;

    // Order the stagger targets right-to-left through the text (last
    // character first) with the logo appended at the very end, so the
    // default index-based stagger (index 0 = least delay) falls one by one
    // from the right and lands on the logo last.
    const reversedChars = [...charsRef.current].reverse();
    const targets = [...reversedChars, logoRef.current].filter(
      (el): el is HTMLElement => el !== null,
    );

    // The intro plays as a full-viewport splash, so it has to sit above the
    // page content while it runs. Once collapsed to the bar, it drops back
    // under. overflow stays clipped so nothing spills past the header bounds
    // mid-animation.
    gsap.set(header, { zIndex: 100 });

    // The lockup already sits at its final resting spot (bottom-left of the
    // collapsed bar) from the very first frame — it never moves. What
    // animates is each character + the logo individually: an explicit `y`
    // pulls each one up to the vertical center of the viewport, computed
    // straight off the lockup's already-final rect, then eases back down to
    // 0. That makes the drop distance/feel author-controlled rather than an
    // emergent side effect of the header's own height tween (which still
    // collapses concurrently purely for the bar's visual size).
    const lockupRect = lockup.getBoundingClientRect();
    const finalCenterY = lockupRect.top + lockupRect.height / 2;
    const initialY = window.innerHeight / 2 - finalCenterY;
    gsap.set(targets, { y: initialY });

    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        gsap.set(header, { zIndex: 50, overflow: "visible" });
      },
    });

    tl.to(header, {
      height: barHeight(),
      duration: 1.2,
      ease: "power3.inOut",
    })
      .to(
        targets,
        {
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: { each: 0.05 },
        },
        "<",
      )
      .fromTo(
        navRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power1.out" },
        "-=0.2",
      );

    // GSAP owns the header's `height` as an inline style from the moment the
    // intro runs, so it no longer tracks the viewport on its own. Now that
    // the bar's height is viewport-derived rather than a flat 54px, a resize
    // has to be written back — otherwise widening the window leaves the bar
    // at its old height while everything inside it scales past it. Skipped
    // while the intro is still playing so this can't fight the tween.
    function handleResize() {
      if (!header || tl.isActive()) return;
      gsap.set(header, { height: barHeight() });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      tl.kill();
    };
  }, []);

  const text = "Stikkman UX";

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 bottom-0 z-50 h-dvh overflow-hidden bg-[#392B56]"
    >
      {/* Everything in the bar is sized as a fraction of `--spacing-bar`, so
          the lockup keeps its proportions inside the bar at any viewport
          width. The fractions are the main site's fixed values over its 54px
          bar: 15/54, 24/54, 18/54. A plain div rather than the main site's
          `<Link href="/">` lockup — this app has exactly one route, so there
          is nowhere to navigate and the pointer-events dance the link needed
          goes away with it. */}
      <div
        ref={lockupRef}
        className="absolute bottom-[calc(var(--spacing-bar)*0.278)] left-[max(24px,3.9vw)] flex items-center gap-fluid-xs"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- GSAP tweens
            this node directly; `next/image` wraps it in its own span and
            would put a layout-shifting placeholder in the middle of the
            intro. It is a 1.6KB static SVG, so there is nothing to
            optimise. */}
        <img
          ref={logoRef}
          src="/LOGO.svg"
          alt="Stikkman UX"
          className="h-[calc(var(--spacing-bar)*0.444)] w-[calc(var(--spacing-bar)*0.444)]"
        />

        <span className="flex text-[calc(var(--spacing-bar)*0.333)] text-white">
          {text.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) charsRef.current[i] = el;
              }}
              className="inline-block whitespace-pre font-cabinet-bold font-bold "
            >
              {char}
            </span>
          ))}
        </span>
      </div>

      <div
        ref={navRef}
        className="absolute right-[max(24px,3.9vw)] bottom-[calc(var(--spacing-bar)*0.278)] flex items-center opacity-0"
      >
        <a
          href={`mailto:${contactEmail}`}
          className="font-mono text-micro tracking-[0.153em] text-white/70 uppercase transition-colors duration-200 hover:text-white"
        >
          {contactEmail}
        </a>
      </div>
    </header>
  );
}
